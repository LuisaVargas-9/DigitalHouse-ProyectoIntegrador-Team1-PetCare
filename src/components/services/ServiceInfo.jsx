//React
import { useState, useEffect, useContext } from "react";
import axios from "axios";

// Pages

// Components
import { StarsComponent } from "../shared/StarsComponent";
import Modal from "../shared/Modal/Modal";
import Login from "../login/Login";

// Styles
import {
	DetailInfoContainer,
	ReviewContainer,
	ReviewsStarsContainer,
	ServiceDetailInfoContainer,
} from "./styled-components/ServiceDetailInfo";

import "../../styles/services/serviceInfo.css";
import CalendarReservasServicio from "../shared/calendar/CalendarReservasServicio";
import { AuthContext } from "../../auth/AuthContext";
import { data, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LiaPawSolid } from "react-icons/lia";
import { MdHeight } from "react-icons/md";

// Images

export const ServiceInfo = ({ serviceInfo }) => {
	const BASE_URL = import.meta.env.VITE_API_URL || "";
	// Fix URL construction - remove duplicate path segments
	const API_URL = `${BASE_URL}/api/reservas`;
	const { auth, updateAuthFromLocalStorage } = useContext(AuthContext);
	const navigate = useNavigate();
	const [isConfirmReserva, setIsConfirmReserva] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [showLoginForm, setShowLoginForm] = useState(false);
	const [rangoFechas, setRangoFechas] = useState([]);
	const [especies, setEspecies] = useState([]);
	const [selectedEspecie, setSelectedEspecie] = useState(1); // Default to first species
	const [error, setError] = useState("");
	const [currentServiceUrl, setCurrentServiceUrl] = useState("");
	const {
		name,
		description,
		service,
		city,
		caracteristicas,
		rating,
		reviews,
		id_servicio,
	} = serviceInfo;
	console.log("Service INFO:", serviceInfo);

	const [reservedDates, setReservedDates] = useState([]);
	const [cuidadoInicial, setCuidadoInicial] = useState("");
	const [cuidadoFinal, setCuidadoFinal] = useState("");

	// Function to verify token before making requests
	const verifyToken = () => {
		// Check localStorage first
		const storedToken = localStorage.getItem("token");

		// If auth doesn't have token but localStorage does, update auth
		if (!auth.token && storedToken) {
			updateAuthFromLocalStorage();
			return storedToken;
		}

		return auth.token || storedToken;
	};

	// Helper function to inspect token
	const inspectToken = (token) => {
		try {
			// Log token format and length but not the full token for security
			console.log("Token format check:", {
				length: token?.length,
				startsWithBearer: token?.startsWith("Bearer "),
				firstChars: token?.substring(0, 10) + "...",
				lastChars: "..." + token?.substring(token?.length - 10),
			});

			return token;
		} catch (e) {
			console.error("Error inspecting token:", e);
			return token;
		}
	};

	const realizarReserva = async () => {
		// Get the most current token - either from context or localStorage
		let currentToken = auth?.token || localStorage.getItem("token");

		if (!currentToken) {
			toast.error("No hay sesión activa. Por favor inicia sesión.");
			setIsLoginModalOpen(true);
			return;
		}

		// Check if the token needs "Bearer " prefix
		const authHeader = currentToken.startsWith("Bearer ")
			? currentToken
			: `Bearer ${currentToken}`;

		console.log("Fechas sin procesar:", rangoFechas);

		// Fix the nested fecha objects problem
		let formattedFechas = [];

		// Check the structure of rangoFechas to apply appropriate formatting
		if (rangoFechas.length > 0) {
			// If rangoFechas already has the right format, use it directly
			if (typeof rangoFechas[0] === "string") {
				// Format: ["2025-04-01", "2025-04-02", ...] -> [{"fecha": "2025-04-01"}, {"fecha": "2025-04-02"}, ...]
				formattedFechas = rangoFechas.map((fecha) => ({ fecha }));
			} else if (
				rangoFechas[0].fecha &&
				typeof rangoFechas[0].fecha === "string"
			) {
				// Format: [{"fecha": "2025-04-01"}, ...] -> already correct, use as is
				formattedFechas = rangoFechas;
			} else if (
				rangoFechas[0].fecha &&
				typeof rangoFechas[0].fecha === "object"
			) {
				// Format: [{"fecha": {"fecha": "2025-04-01"}}, ...] -> [{"fecha": "2025-04-01"}, ...]
				formattedFechas = rangoFechas.map((item) => ({
					fecha: item.fecha.fecha,
				}));
			}
		}

		console.log("Fechas formateadas correctamente:", formattedFechas);

		// Get user ID from auth context or localStorage
		const userId = auth?.idUsuario || localStorage.getItem("idUser");

		if (!userId) {
			toast.error(
				"No se pudo identificar al usuario. Por favor, inicia sesión nuevamente."
			);
			setIsLoginModalOpen(true);
			return;
		}

		// Create reservation data object
		const reservaData = {
			fechas: formattedFechas,
			estado: "CONFIRMADA",
			idUsuario: parseInt(userId),
			idEspecie: selectedEspecie,
			idServicio: parseInt(id_servicio),
		};

		console.log("======= DATOS DE RESERVA FINALES =======");
		console.log(JSON.stringify(reservaData, null, 2));
		console.log("========================================");

		try {
			console.log(
				"Authorization header format:",
				`${authHeader.substring(0, 20)}...${authHeader.substring(
					authHeader.length - 15
				)}`
			);

			const response = await axios.post(`${API_URL}/reserva`, reservaData, {
				headers: {
					Authorization: authHeader,
					"Content-Type": "application/json",
				},
			});

			// Handle success response
			if (response.status === 201 || response.status === 200) {
				toast.success("¡Reserva creada con éxito!", {
					position: "top-right",
					autoClose: 2000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
				});
				fetchReservedDates();
			}
		} catch (error) {
			console.error("Error al crear reserva:", error);
			console.error("Request URL:", `${API_URL}/reserva`);
			console.error("Request data:", JSON.stringify(reservaData));

			// Enhanced error logging
			if (error.response) {
				console.error("Estado HTTP:", error.response.status);
				console.error(
					"Datos de respuesta:",
					JSON.stringify(error.response.data)
				);
				console.error(
					"Headers de respuesta:",
					JSON.stringify(error.response.headers)
				);
				console.error(
					"Config de solicitud:",
					JSON.stringify(error.config, (key, value) => {
						// Remove sensitive auth details from logs
						if (key === "headers" && value.Authorization) {
							return { ...value, Authorization: "[REDACTED]" };
						}
						return value;
					})
				);

				// Special handling for empty response bodies
				if (error.response.status === 403) {
					let errorMsg = "No tienes permisos para crear esta reserva.";

					try {
						if (error.response.data) {
							// Try to parse the response data if it's a string
							if (typeof error.response.data === "string") {
								const parsedData = JSON.parse(error.response.data);
								if (parsedData.message) {
									errorMsg = parsedData.message;
								}
							} else if (error.response.data.message) {
								errorMsg = error.response.data.message;
							}
						}
					} catch (e) {
						console.error("Error parsing response data:", e);
					}

					toast.error(errorMsg);

					// Only show login modal for token issues
					if (
						errorMsg.includes("token") ||
						errorMsg.includes("sesión") ||
						errorMsg.includes("autenti")
					) {
						setIsLoginModalOpen(true);
					}
				} else {
					// Other errors
					const errorMessage =
						error.response.data?.message ||
						error.response.data?.error ||
						"Error al crear la reserva. Por favor intenta nuevamente.";

					setError(errorMessage);
					toast.error(errorMessage);
				}
			} else {
				toast.error(
					"Error de conexión. Por favor verifica tu conexión a internet."
				);
			}
		} finally {
			setIsConfirmReserva(false);
		}
	};

	// Update fetch functions to use improved token handling
	const fetchReservedDates = async () => {
		try {
			let currentToken = auth?.token || localStorage.getItem("token");

			// Adjust this based on your API requirements!
			const authHeader = currentToken.startsWith("Bearer ")
				? currentToken
				: `Bearer ${currentToken}`;

			const response = await axios.get(
				`${API_URL}/${id_servicio}/fechas-reservas`,
				{
					headers: {
						Authorization: authHeader,
					},
				}
			);

			setReservedDates(response.data);
		} catch (error) {
			console.error("Error fetching reserved dates:", error);
			// Don't show error messages for this non-critical function
		}
	};

	const fetchEspecie = async () => {
		try {
			const response = await axios.get(`${BASE_URL}/api/especies`);
			console.log(response);
			setEspecies(response.data);
		} catch (error) {
			console.error("Error fetching especies: ", error);
		}
	};

	useEffect(() => {
		fetchReservedDates();
		fetchEspecie();
		// Store the current URL for redirection after login
		setCurrentServiceUrl(window.location.href);
	}, []);

	const openConfirmReservaModal = (category) => {
		// Check if user is logged in
		if (!auth || !auth.token) {
			// User is not logged in, show login modal
			setIsLoginModalOpen(true);
		} else {
			// User is logged in, continue with reservation
			setIsConfirmReserva(true);
		}
	};

	const handleIsConfirmReserva = () => {
		realizarReserva();
	};

	const handleIsConfirmReservaCancel = () => {
		setIsConfirmReserva(false);
	};

	const handleLoginModalClose = () => {
		setIsLoginModalOpen(false);
	};

	const redirectToLogin = () => {
		// Close the current modal and show login form
		setIsLoginModalOpen(false);
		setShowLoginForm(true);
	};

	const closeLoginForm = () => {
		setShowLoginForm(false);
	};

	function formatDates(initialDate, finalDate) {
		const months = [
			"enero",
			"febrero",
			"marzo",
			"abril",
			"mayo",
			"junio",
			"julio",
			"agosto",
			"septiembre",
			"octubre",
			"noviembre",
			"diciembre",
		];

		const days = [
			"domingo",
			"lunes",
			"martes",
			"miércoles",
			"jueves",
			"viernes",
			"sábado",
		];

		const parseDate = (dateString) => {
			const date = new Date(dateString);
			return {
				dayName: days[date.getDay()],
				date: date.getDate(),
				monthName: months[date.getMonth()],
				year: date.getFullYear(),
			};
		};

		const start = parseDate(initialDate);
		const end = parseDate(finalDate);

		return (
			<div className="periodoFechasConfirm">
				<p>
					del{" "}
					<span>
						{start.dayName} {start.date} de {start.monthName} del {start.year}
					</span>
				</p>
				<p>
					al{" "}
					<span>
						{end.dayName} {end.date} de {end.monthName} del {end.year}
					</span>
				</p>
			</div>
		);
	}

	// Handle species selection change
	const handleEspecieChange = (event) => {
		setSelectedEspecie(Number(event.target.value));
	};

	return (
		<div className="serviceInfoContainer">
			<div>
				<div className="reviewContainer">
					<div className="reviewStartContainer">
						<p>Calificación y reseña del servicio</p>
						<StarsComponent rating={rating} key={name} />
						<div className="textReview">
							<p> cantidad </p>
							<p>de reseñas</p>
						</div>
					</div>
				</div>

				<div className="detailInfoContainer">
					<p className="name">{name}</p>
					<div>
						<p className="details">
							{caracteristicas[1]?.valor} | {caracteristicas[3]?.valor} de
							experiencia
						</p>
					</div>

					<p className="details">"{description}"</p>
				</div>

				<div className="features">
					{caracteristicas.map((caracteristica) => (
						<div className="featureRow" key={caracteristica.idCaracteristica}>
							{caracteristica?.icon && (
								<>
									<img
										src={caracteristica.icon}
										alt={caracteristica?.nombre}
										height={40}
									/>
									<p>
										{caracteristica?.nombre} : {caracteristica?.valor}
									</p>
								</>
							)}
						</div>
					))}
				</div>
			</div>

			<div className="reservasContainer">
				<CalendarReservasServicio
					reservedDates={reservedDates}
					setCuidadoInicial={setCuidadoInicial}
					setCuidadoFinal={setCuidadoFinal}
					setRangoFechas={(dates) => {
						// Ensure the dates are in the correct format before setting state
						console.log("Fechas recibidas del calendario:", dates);
						setRangoFechas(dates);
					}}
				/>

				<form action="">
					<div className="formReservaContainer">
						<div className="formReservaCuidados formReservaGral">
							<div>
								<label htmlFor="cuidadoInicial">Cuidado Inicial</label>
								<input
									type="text"
									id="cuidadoInicial"
									value={cuidadoInicial}
									readOnly
								/>
							</div>
							<div>
								<label htmlFor="cuidadoFinal">Cuidado Final</label>
								<input
									type="text"
									id="cuidadoFinal"
									value={cuidadoFinal}
									readOnly
								/>
							</div>
						</div>

						<div className="formReservaMascotas formReservaGral">
							<label htmlFor="">Cantidad de mascotas</label>
							<select className="select" name="" id="">
								<option value="">1 Mascota</option>
								<option value="">2 Mascotas</option>
								<option value="">3 Mascotas</option>
								<option value="">4 Mascotas</option>
							</select>
						</div>

						<div className="formReservaMascotasTipo formReservaGral">
							<label htmlFor="especies">Tipo de mascota</label>
							<select
								className="select"
								name="especies"
								id="especies"
								onChange={handleEspecieChange}
								value={selectedEspecie}
							>
								{especies.map((especie) => (
									<option key={especie.idEspecie} value={especie.idEspecie}>
										{especie.nombreEspecie}
									</option>
								))}
							</select>
						</div>

						<div className="formReservaReembolso formReservaGral">
							<label>No reembolsable - $0000 COP en total</label>
							<div className="formReservaReembolsoRow">
								<div className="width">
									<p>
										Cancelación gratuita durante 24 horas. Después de ese plazo,
										la reservación no es reembolsable.
									</p>
									<p>Reembolsable - $0000 COP en total</p>
								</div>
								<label>
									<input
										type="radio"
										name="reserva"
										value="cancelacion-gratuita"
									/>
									<span className="custom-radio"></span>
								</label>
							</div>

							<div className="formReservaReembolsoRow">
								<p className="width">
									Cancelación gratuita antes del 27 mar. Si cancelas antes del
									check-in el 1 abr, recibirás un reembolso parcial.
								</p>
								<label>
									<input
										type="radio"
										name="reserva"
										value="parcial-reembolso"
									/>
									<span className="custom-radio"></span>
								</label>
							</div>
						</div>
					</div>

					<div className="btnReservaContainer">
						<button
							type="button"
							onClick={openConfirmReservaModal}
							className="btnReservar"
						>
							Reserva
						</button>
						<p>No se hará ningún cargo por el momento</p>
					</div>
				</form>
			</div>

			{isConfirmReserva && (
				<div className="modal-overlay">
					{cuidadoInicial && cuidadoFinal ? (
						<div className="modal-container">
							<LiaPawSolid className="modal-icon" />
							<p>
								<strong>Periodo de fechas reservadas:</strong>
							</p>
							{formatDates(cuidadoInicial, cuidadoFinal)}

							<div className="modal-buttons">
								<button
									className="modal-button cancel"
									onClick={handleIsConfirmReservaCancel}
								>
									Cancelar
								</button>
								<button
									className="modal-button confirm"
									onClick={handleIsConfirmReserva}
								>
									Confirmar
								</button>
							</div>
						</div>
					) : (
						<div className="modal-container">
							<LiaPawSolid className="modal-icon" />
							<p>Necesitas seleccionar las fechas del periodo de reserva.</p>

							<div className="modal-buttons">
								<button
									className="modal-button cancel"
									onClick={handleIsConfirmReservaCancel}
								>
									Aceptar
								</button>
							</div>
						</div>
					)}
				</div>
			)}

			{isLoginModalOpen && (
				<div className="modal-overlay">
					<div className="modal-container">
						<LiaPawSolid className="modal-icon" />
						<p>
							<strong>Necesitas iniciar sesión</strong>
						</p>
						<p>Para realizar una reserva, debes iniciar sesión primero.</p>

						<div className="modal-buttons">
							<button
								className="modal-button cancel"
								onClick={handleLoginModalClose}
							>
								Cancelar
							</button>
							<button
								className="modal-button confirm"
								onClick={redirectToLogin}
							>
								Ir a iniciar sesión
							</button>
						</div>
					</div>
				</div>
			)}

			{showLoginForm && (
				<Modal onClose={closeLoginForm}>
					<Login isLoginValue={true} returnUrl={currentServiceUrl} />
				</Modal>
			)}
		</div>
	);
};

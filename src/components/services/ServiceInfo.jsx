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
	const API_URL = `${BASE_URL}/api/reservas`;
	const { auth } = useContext(AuthContext);
	const navigate = useNavigate();
	const [isConfirmReserva, setIsConfirmReserva] = useState(false);
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [showLoginForm, setShowLoginForm] = useState(false);
	const [rangoFechas, setRangoFechas] = useState([]);
	const [especies, setEspecies] = useState([]);
	const [error, setError] = useState("");
	const [currentServiceUrl, setCurrentServiceUrl] = useState('');
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

	const realizarReserva = async () => {
		for (let reserva in rangoFechas) {
			console.log("Fecha del rango: " + rangoFechas[reserva]);
		}
		const reservaData = {
			fechas: rangoFechas,
			estado: "CONFIRMADA",
			idUsuario: auth.idUsuario,
			idEspecie: 1,
			idServicio: id_servicio,
		};

		try {
			const response = await axios.post(`${API_URL}/reserva`, reservaData, {
				headers: {
					Authorization: `Bearer ${auth.token}`,
					"Content-Type": "application/json",
				},
			});

			// Verifica si se creó la reserva correctamente
			if (response.status === 201) {
				toast.success("Reserva creada con éxito!", {
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
				console.log("Respuesta del servidor:", response.data);
			} else {
				console.error("Error al crear la reserva", response);
				toast.success("Hubo un problema al crear la reserva", {
					position: "top-right",
					autoClose: 2000,
					hideProgressBar: false,
					closeOnClick: true,
					pauseOnHover: true,
					draggable: true,
					progress: undefined,
					theme: "light",
				});
			}
		} catch (error) {
			const errorMessage =
				error.response?.status === 403
					? "No tienes permisos para crear una reserva"
					: "Error al crear la reserva";
			setError(errorMessage);
			toast.error(errorMessage);
		} finally {
			setIsConfirmReserva(false);
			fetchReservedDates();
		}
	};

	const fetchReservedDates = async () => {
		try {
			const response = await axios.get(
				`${API_URL}/${id_servicio}/fechas-reservas`,
				{
					headers: {
						Authorization: `Bearer ${auth.token}`,
					},
				}
			);
			console.log(response);
			setReservedDates(response.data);
		} catch (error) {
			console.error("Error fetching reserved dates:", error);
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
					setRangoFechas={setRangoFechas}
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
							<label htmlFor="">Tipo de mascota</label>
							<select className="select" name="especies">
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

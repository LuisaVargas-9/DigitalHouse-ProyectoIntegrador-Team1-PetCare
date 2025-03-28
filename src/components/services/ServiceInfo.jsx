import { useState, useEffect, useContext } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { LiaPawSolid } from "react-icons/lia";

// Components
import { StarsComponent } from "../shared/StarsComponent";
import Modal from "../shared/Modal/Modal";
import Login from "../login/Login";
import CalendarReservasServicio from "../shared/calendar/CalendarReservasServicio";

// Context
import { AuthContext } from "../../auth/AuthContext";

// Images
import closeIcon from "../../images/cerrar.png";
import pawsIcon from "../../images/paws.png";
import clockIcon from "../../images/clock.png";
import calendarIcon from "../../images/calendar.png";
import catIcon from "../../images/cat.png";
import payIcon from "../../images/pay.png";
import animalIcon from "../../images/animal.png";
import communicationIcon from "../../images/communication.png";

// Styles
import "../../styles/services/serviceInfo.css";

// Constants
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
];

const DAYS = [
  "domingo", "lunes", "martes", "miércoles", 
  "jueves", "viernes", "sábado"
];

const ServiceInfo = ({ serviceInfo }) => {
  const BASE_URL = import.meta.env.VITE_API_URL || "";
  const API_URL = `${BASE_URL}/api/reservas`;
  const { auth, updateAuthFromLocalStorage } = useContext(AuthContext);
  const navigate = useNavigate();

  // States
  const [isConfirmReserva, setIsConfirmReserva] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [rangoFechas, setRangoFechas] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [selectedEspecie, setSelectedEspecie] = useState(1);
  const [error, setError] = useState("");
  const [currentServiceUrl, setCurrentServiceUrl] = useState("");
  const [reservedDates, setReservedDates] = useState([]);
  const [cuidadoInicial, setCuidadoInicial] = useState("");
  const [cuidadoFinal, setCuidadoFinal] = useState("");

  // Service info destructuring
  const {
    name,
    description,
    caracteristicas,
    rating,
    reviews,
    id_servicio,
  } = serviceInfo;

  // Token verification
  const verifyToken = () => {
    const storedToken = localStorage.getItem("token");
    if (!auth.token && storedToken) {
      updateAuthFromLocalStorage();
      return storedToken;
    }
    return auth.token || storedToken;
  };

  // Reservation handler
  const realizarReserva = async () => {
    const currentToken = verifyToken();
    
    if (!currentToken) {
      toast.error("Debes iniciar sesión para reservar");
      setIsLoginModalOpen(true);
      return;
    }

    // Format dates
    const formattedFechas = rangoFechas.map(fecha => 
      typeof fecha === "string" ? { fecha } : 
      fecha.fecha?.fecha ? { fecha: fecha.fecha.fecha } : fecha
    );

    const userId = auth?.idUsuario || localStorage.getItem("idUser");
    
    try {
      const response = await axios.post(`${API_URL}/reserva`, {
        fechas: formattedFechas,
        estado: "CONFIRMADA",
        idUsuario: parseInt(userId),
        idEspecie: selectedEspecie,
        idServicio: parseInt(id_servicio),
      }, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Content-Type": "application/json"
        }
      });

      if ([200, 201].includes(response.status)) {
        toast.success("¡Reserva creada con éxito!");
        fetchReservedDates();
      }
    } catch (error) {
      handleReservationError(error);
    } finally {
      setIsConfirmReserva(false);
    }
  };

  const handleReservationError = (error) => {
    const errorMessage = error.response?.data?.message ||
      "Error al crear la reserva. Por favor intenta nuevamente.";
    
    toast.error(errorMessage);
    
    if (error.response?.status === 403) {
      setIsLoginModalOpen(true);
    }
  };

  // Data fetching
  const fetchReservedDates = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/${id_servicio}/fechas-reservas`,
        { headers: { Authorization: `Bearer ${verifyToken()}` } }
      );
      setReservedDates(response.data);
    } catch (error) {
      console.error("Error fetching reserved dates:", error);
    }
  };

  const fetchEspecies = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/especies`);
      setEspecies(response.data);
    } catch (error) {
      console.error("Error fetching especies:", error);
    }
  };

  useEffect(() => {
    fetchReservedDates();
    fetchEspecies();
    setCurrentServiceUrl(window.location.href);
  }, []);

  // Modal handlers
  const openConfirmReservaModal = () => {
    if (!verifyToken()) {
      setIsLoginModalOpen(true);
      return;
    }
    setIsConfirmReserva(true);
  };

  // Date formatting
  const formatDates = (initialDate, finalDate) => {
    const parseDate = (dateString) => {
      const date = new Date(dateString);
      return {
        dayName: DAYS[date.getDay()],
        date: date.getDate(),
        monthName: MONTHS[date.getMonth()],
        year: date.getFullYear()
      };
    };

    const start = parseDate(initialDate);
    const end = parseDate(finalDate);

    return (
      <div className="periodoFechasConfirm">
        <p>del <span>{start.dayName} {start.date} de {start.monthName} del {start.year}</span></p>
        <p>al <span>{end.dayName} {end.date} de {end.monthName} del {end.year}</span></p>
      </div>
    );
  };

  // Terms modal component
  const TermsModal = () => (
    <div className="modal-overlay">
      <div className="terms-modal">
        <button className="terms-close-icon" onClick={() => setShowTerms(false)}>
          <img src={closeIcon} alt="Cerrar" />
        </button>
        <h2>Términos y condiciones del servicio</h2>

        {[
          {
            icon: pawsIcon,
            title: "Cuidado responsable",
            content: "Nos comprometemos a brindar atención profesional a tu mascota."
          },
          {
            icon: clockIcon,
            title: "Puntualidad",
            content: "Respetamos tu tiempo y el de nuestros cuidadores."
          },
          {
            icon: calendarIcon,
            title: "Cancelaciones",
            content: "Cancelación gratuita 24 horas antes."
          },
          {
            icon: catIcon,
            title: "Mascotas sociables",
            content: "Tu mascota debe ser sociable para una mejor experiencia."
          },
          {
            icon: payIcon,
            title: "Pago seguro",
            content: "Métodos de pago confiables y seguros."
          },
          {
            icon: animalIcon,
            title: "Ambiente seguro",
            content: "Debes mantener un ambiente limpio y seguro."
          },
          {
            icon: communicationIcon,
            title: "Comunicación",
            content: "Mantendremos comunicación constante durante el servicio."
          }
        ].map((section, index) => (
          <div className="terms-section" key={index}>
            <div className="terms-section-content">
              <img src={section.icon} alt={section.title} className="terms-icon" />
              <div>
                <h3>{section.title}</h3>
                <p>{section.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="serviceInfoContainer">
      {/* Sección izquierda - Información del servicio */}
      <div>
        <div className="reviewContainer">
          <div className="reviewStartContainer">
            <p>Calificación y reseña del servicio</p>
            <StarsComponent rating={rating} />
            <div className="textReview">
              <p>{reviews.length} reseñas</p>
            </div>
          </div>
        </div>

        <div className="detailInfoContainer">
          <h1 className="name">{name}</h1>
          <p className="details">
            {caracteristicas[1]?.valor} | {caracteristicas[3]?.valor} de experiencia
          </p>
          <p className="description">"{description}"</p>
        </div>

        <div className="features">
          {caracteristicas.map((caracteristica) => (
            <div className="featureRow" key={caracteristica.idCaracteristica}>
              {caracteristica?.icon && (
                <>
                  <img
                    src={caracteristica.icon}
                    alt={caracteristica.nombre}
                    height={40}
                  />
                  <p>{caracteristica.nombre}: {caracteristica.valor}</p>
                </>
              )}
            </div>
          ))}
        </div>

        <button 
          className="terms-button"
          onClick={() => setShowTerms(true)}
        >
          Ver políticas de uso
        </button>
        {showTerms && <TermsModal />}
      </div>

      {/* Sección derecha - Reservas */}
      <div className="reservasContainer">
        <CalendarReservasServicio
          reservedDates={reservedDates}
          setCuidadoInicial={setCuidadoInicial}
          setCuidadoFinal={setCuidadoFinal}
          setRangoFechas={setRangoFechas}
        />

        <form className="formReservaContainer">
          <div className="formReservaCuidados formReservaGral">
            <div>
              <label>Cuidado Inicial</label>
              <input
                type="text"
                value={cuidadoInicial}
                readOnly
              />
            </div>
            <div>
              <label>Cuidado Final</label>
              <input
                type="text"
                value={cuidadoFinal}
                readOnly
              />
            </div>
          </div>

          <div className="formReservaMascotas formReservaGral">
            <label>Cantidad de mascotas</label>
            <select>
              {[1, 2, 3, 4].map(num => (
                <option key={num} value={num}>{num} Mascota{num > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          <div className="formReservaMascotasTipo formReservaGral">
            <label>Tipo de mascota</label>
            <select
              value={selectedEspecie}
              onChange={(e) => setSelectedEspecie(Number(e.target.value))}
            >
              {especies.map(especie => (
                <option key={especie.idEspecie} value={especie.idEspecie}>
                  {especie.nombreEspecie}
                </option>
              ))}
            </select>
          </div>

          <div className="btnReservaContainer">
            <button
              type="button"
              className="btnReservar"
              onClick={openConfirmReservaModal}
            >
              Reservar ahora
            </button>
            <p>No se realizará ningún cargo inmediato</p>
          </div>
        </form>
      </div>

      {/* Modales */}
      {isConfirmReserva && (
        <div className="modal-overlay">
          <div className="modal-container">
            <LiaPawSolid className="modal-icon" />
            {cuidadoInicial && cuidadoFinal ? (
              <>
                <p><strong>Periodo de reserva:</strong></p>
                {formatDates(cuidadoInicial, cuidadoFinal)}
                <div className="modal-buttons">
                  <button className="modal-button cancel" onClick={() => setIsConfirmReserva(false)}>
                    Cancelar
                  </button>
                  <button className="modal-button confirm" onClick={realizarReserva}>
                    Confirmar
                  </button>
                </div>
              </>
            ) : (
              <>
                <p>Selecciona un rango de fechas válido</p>
                <button className="modal-button cancel" onClick={() => setIsConfirmReserva(false)}>
                  Aceptar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {isLoginModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container">
            <LiaPawSolid className="modal-icon" />
            <h3>Inicio de sesión requerido</h3>
            <p>Para realizar reservas necesitas estar autenticado</p>
            <div className="modal-buttons">
              <button className="modal-button cancel" onClick={() => setIsLoginModalOpen(false)}>
                Cancelar
              </button>
              <button className="modal-button confirm" onClick={() => navigate("/login")}>
                Ir a login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ServiceInfo.propTypes = {
  serviceInfo: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    caracteristicas: PropTypes.arrayOf(
      PropTypes.shape({
        idCaracteristica: PropTypes.number,
        nombre: PropTypes.string,
        valor: PropTypes.string,
        icon: PropTypes.string
      })
    ).isRequired,
    rating: PropTypes.number.isRequired,
    reviews: PropTypes.array.isRequired,
    id_servicio: PropTypes.number.isRequired
  }).isRequired
};

export default ServiceInfo;
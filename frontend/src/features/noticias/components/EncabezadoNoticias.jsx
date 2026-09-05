import noticiaIcon from "../../../assets/Noticia.png";

export default function EncabezadoNoticias({ onNueva }) {
  return (
    <header className="azure-page-header news-management-header">
      <div className="news-management-copy">
        <span className="news-management-eyebrow">
          Comunicaciones
        </span>
        <p>Administra y mantén informada a toda la organización.</p>
      </div>

      {onNueva && (
        <button
          type="button"
          onClick={onNueva}
          aria-label="Crear nueva noticia"
          title="Crear nueva noticia"
          className="news-create-button"
        >
          <img src={noticiaIcon} alt="" />
        </button>
      )}
    </header>
  );
}

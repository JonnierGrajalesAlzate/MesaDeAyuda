import { useEffect, useRef, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import alerta from "../../../../shared/services/alertService.js";
import {
  actualizarUsuario,
  crearUsuario,
  obtenerTransferenciaPendiente,
} from "../../services/CRUD/usuariosService.js";
import TransferTicketsModal from "./TransferTicketsModal.jsx";

const EMPTY_USER = {
  nombre: "",
  apellido: "",
  cargo: "",
  correo: "",
  password: "",
  rol_id: "",
  area_id: "",
  estado: "Activo",
  categoria_ids: [],
};

const ESTADOS_USUARIO = ["Activo", "Desactivado"];

const TEXT_FIELDS = [
  ["nombre", "Nombre"],
  ["apellido", "Apellido"],
  ["cargo", "Cargo"],
  ["correo", "Correo electrónico"],
];

function formatCreationDate(value) {
  if (!value) return "Se asignará al crear";

  return new Date(value).toLocaleString("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function DetailValue({ label, value }) {
  return <div className="min-w-0 py-2">
      <span className="block text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
      <p className="mt-1 break-words text-sm font-semibold text-[#1e222b]">{value || "No registrado"}</p>
    </div>;
}

export default function UsuarioFormulario({
  usuario,
  roles,
  areas,
  categorias,
  modo,
  initialAreaId = "",
  onCancel,
  onSaved,
}) {
  const readOnly = modo === "ver";
  const [form, setForm] = useState({
    ...EMPTY_USER,
    area_id: initialAreaId || EMPTY_USER.area_id,
    ...usuario,
    password: "",
    categoria_ids: Array.isArray(usuario?.categoria_ids)
      ? usuario.categoria_ids.map(Number)
      : [],
  });
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [transferPlan, setTransferPlan] = useState(null);
  const firstInputRef = useRef(null);
  const selectedRole = roles.find(role => Number(role.id) === Number(form.rol_id));
  const normalizedRole = String(selectedRole?.nombre || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
  const isResponsible = normalizedRole.includes("tecn") || normalizedRole.includes("admin");

  useEffect(() => {
    if (!readOnly) firstInputRef.current?.focus();
  }, [readOnly]);

  const changeField = ({ target }) => {
    setDirty(true);
    setForm((currentForm) => ({
      ...currentForm,
      [target.name]: target.value,
      ...(target.name === "rol_id" && !["1", "2"].includes(String(target.value))
        ? { categoria_ids: [] }
        : {}),
    }));
  };

  const toggleCategory = categoryId => {
    setDirty(true);
    setForm(currentForm => {
      const selected = currentForm.categoria_ids || [];
      return {
        ...currentForm,
        categoria_ids: selected.includes(categoryId)
          ? selected.filter(id => id !== categoryId)
          : [...selected, categoryId]
      };
    });
  };

  const saveUser = async payload => {
    setSaving(true);
    try {
      const data = usuario
        ? await actualizarUsuario(usuario.id, payload)
        : await crearUsuario(payload);

      await alerta.fire({
        icon: "success",
        title: data.message,
        timer: 1400,
        showConfirmButton: false,
      });
      onSaved();
    } catch (error) {
      await alerta.fire({
        icon: "error",
        title: "No se pudo guardar",
        text: error.response?.data?.message || "Revisa los datos",
      });
    } finally {
      setSaving(false);
    }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (readOnly || !dirty) return;
    if (isResponsible && form.categoria_ids.length === 0) {
      await alerta.fire({
        icon: "warning",
        title: "Selecciona una categoría",
        text: "Los técnicos y administradores deben encargarse de al menos una categoría."
      });
      return;
    }

    if (usuario && form.estado === "Desactivado") {
      setSaving(true);
      try {
        const plan = await obtenerTransferenciaPendiente(usuario.id);
        if (plan.total > 0) {
          setTransferPlan(plan);
          return;
        }
      } catch (error) {
        await alerta.fire({
          icon: "error",
          title: "No se pudo revisar la carga pendiente",
          text: error.response?.data?.message || "Intenta nuevamente."
        });
        return;
      } finally {
        setSaving(false);
      }
    }

    await saveUser(form);
  };

  return <div className="crud-detail-card">
    <form onSubmit={submit}>
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-xl font-bold text-[#1e222b]">
          {readOnly ? "Detalle del usuario" : usuario ? "Editar usuario" : "Nuevo usuario"}
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {readOnly
            ? "Consulta la información registrada y administra esta cuenta."
            : usuario
            ? "Actualiza la información de la cuenta."
            : "Registra una nueva cuenta en el sistema."}
        </p>
      </div>

      {readOnly ? <div className="px-5 py-4">
          <div className="grid gap-x-8 gap-y-1 border-b border-slate-200 pb-4 sm:grid-cols-2">
            <DetailValue label="Nombre" value={usuario?.nombre} />
            <DetailValue label="Apellido" value={usuario?.apellido} />
            <DetailValue label="Correo electrónico" value={usuario?.correo} />
            <DetailValue label="Cargo" value={usuario?.cargo} />
            <DetailValue label="Rol" value={usuario?.rol} />
            <DetailValue label="Área" value={usuario?.area} />
            <DetailValue
              label="Categorías asignadas"
              value={usuario?.rol === "Tecnico" || usuario?.rol === "Administrador"
                ? usuario?.categorias || "Sin categorías"
                : "No aplica"}
            />
            <DetailValue label="Estado de la cuenta" value={usuario?.estado || "Activo"} />
            <DetailValue label="Conexión actual" value={usuario?.presencia || "Fuera de línea"} />
            <DetailValue label="Fecha de creación" value={formatCreationDate(usuario?.fecha_creacion)} />
          </div>
          <p className="pt-4 text-xs leading-relaxed text-slate-500">
            La contraseña está protegida y no se muestra. Puedes reemplazarla al editar el usuario.
          </p>
        </div> : <div className="grid gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-2">
          {TEXT_FIELDS.map(([name, label]) => <label key={name} className="text-sm font-semibold text-slate-700">
              {label}
              <input
                ref={name === "nombre" ? firstInputRef : undefined}
                required={name !== "cargo"}
                name={name}
                value={form[name] || ""}
                onChange={changeField}
                className="field"
                type={name === "correo" ? "email" : "text"}
              />
            </label>)}

          <label className="text-sm font-semibold text-slate-700">
            Rol
            <select required name="rol_id" value={form.rol_id || ""} onChange={changeField} className="field">
              <option value="">Selecciona un rol</option>
              {roles.map(role => <option key={role.id} value={role.id}>{role.nombre}</option>)}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Área
            <select required name="area_id" value={form.area_id || ""} onChange={changeField} className="field">
              <option value="">Selecciona un área</option>
              {areas.map(area => <option key={area.id} value={area.id}>{area.nombre}</option>)}
            </select>
          </label>

          {usuario && <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            Estado de la cuenta
            <select required name="estado" value={form.estado || "Activo"} onChange={changeField} className="field">
              {ESTADOS_USUARIO.map(estado => <option key={estado} value={estado}>{estado}</option>)}
            </select>
            <span className="mt-1.5 block text-xs font-normal text-slate-500">
              Los usuarios desactivados no pueden iniciar sesión y sus datos se conservan.
            </span>
          </label>}

          {isResponsible && <fieldset className="sm:col-span-2">
            <legend className="text-sm font-semibold text-slate-700">Categorías a cargo</legend>
            <p className="mt-1 text-xs text-slate-500">
              Puede seleccionar varias categorías. El responsable recibirá tickets únicamente de las categorías asignadas.
            </p>
            <div className="mt-2 grid max-h-44 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2">
              {categorias.map(categoria => {
                const categoryId = Number(categoria.id);
                const checked = form.categoria_ids.includes(categoryId);
                return <label key={categoria.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${checked ? "border-[#0076e3] bg-[#eaf4ff] text-[#0068c8]" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCategory(categoryId)}
                    className="h-4 w-4 accent-[#0076e3]"
                  />
                  <span className="font-semibold">{categoria.nombre}</span>
                </label>;
              })}
              {categorias.length === 0 && <p className="text-xs text-slate-500 sm:col-span-2">No hay categorías disponibles.</p>}
            </div>
          </fieldset>}

          <label className="text-sm font-semibold text-slate-700 sm:col-span-2">
            {usuario ? "Nueva contraseña (opcional)" : "Contraseña"}
            <div className="relative">
              <input
                required={!usuario}
                minLength="8"
                maxLength="72"
                name="password"
                value={form.password}
                onChange={changeField}
                className="field pr-11"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(value => !value)}
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" /> : <Eye className="h-4.5 w-4.5" strokeWidth={2} aria-hidden="true" />}
              </button>
            </div>
          </label>

          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:col-span-2">
            <span className="font-semibold text-slate-700">Fecha de creación:</span>{" "}
            {formatCreationDate(usuario?.fecha_creacion)}
          </div>
        </div>}

      {!readOnly && <footer className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-3.5 sm:flex-row sm:justify-end">
        <button key="cancel-editing" type="button" onClick={onCancel} className="min-h-10 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100">
          Cancelar
        </button>
        <button key="save-user" type="submit" disabled={saving || !dirty} className="min-h-10 bg-[#0076e3] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#005fbd] disabled:cursor-not-allowed disabled:opacity-50">
          {saving ? "Guardando…" : "Guardar"}
        </button>
      </footer>}
    </form>
    <TransferTicketsModal
      key={`desactivar-${usuario?.id || "usuario"}`}
      usuario={usuario}
      plan={transferPlan}
      saving={saving}
      onClose={() => setTransferPlan(null)}
      onConfirm={technicianId => saveUser({ ...form, transferir_a_id: technicianId })}
    />
  </div>;
}

import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { createTournament, updateTournament, getTournament } from "../../api/tournamentService";
import Button from "../../components/common/Button";
import Input  from "../../components/common/Input";
import Loader from "../../components/common/Loader";
import { SPORT_TYPES } from "../../utils/constants";
import { extractError, getImageUrl } from "../../utils/helpers";
import useAuth from "../../hooks/useAuth";

/**
 * CreateTournament — handles both create and edit.
 *
 * TournamentDto fields:
 *   id, name, sport, imageUrl, maxTeams, startDate (yyyy-MM-dd),
 *   endDate (yyyy-MM-dd), location, description, prize, createAt
 *
 * POST /tournaments → multipart/form-data
 *   - "tournament": JSON blob of TournamentDto
 *   - "image": MultipartFile (REQUIRED for create)
 *   - Requires ROLE_ADMIN
 *
 * PUT /tournaments/{id} → JSON body (no image upload on edit)
 */

const EMPTY = {
  name: "", sport: "", description: "",
  startDate: "", endDate: "",
  location: "", maxTeams: 16, prize: 0,
};

function CreateTournament() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEdit   = !!id;

  const [form, setForm]         = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  const [error, setError]       = useState("");
  const [errors, setErrors]     = useState({});

  // Only ADMIN can create; anyone can edit (update doesn't check role in backend)
  const canCreate = user?.role === "ROLE_ADMIN";

  // Pre-populate form when editing
  useEffect(() => {
    if (!isEdit) return;
    getTournament(id)
      .then(({ data }) => {
        setForm({
          name:        data.name        || "",
          sport:       data.sport       || "",
          description: data.description || "",
          startDate:   data.startDate   || "",
          endDate:     data.endDate     || "",
          location:    data.location    || "",
          maxTeams:    data.maxTeams    ?? 16,
          prize:       data.prize       ?? 0,
        });
        if (data.imageUrl) setExistingImageUrl(getImageUrl(data.imageUrl));
      })
      .catch((err) => setError(extractError(err)))
      .finally(() => setFetching(false));
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.name.trim())  e.name      = "Name is required";
    if (!form.sport)        e.sport     = "Sport is required";
    if (!form.startDate)    e.startDate = "Start date is required";
    if (!form.endDate)      e.endDate   = "End date is required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = "End date must be after start date";
    if (!isEdit && !imageFile) e.image  = "Tournament image is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: undefined }));
    setError("");
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setErrors((prev) => ({ ...prev, image: undefined }));
    // Show preview
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        maxTeams: Number(form.maxTeams),
        prize:    Number(form.prize),
      };

      if (isEdit) {
        // PUT accepts JSON body (no image on update)
        await updateTournament(id, payload);
      } else {
        // POST requires multipart: tournament JSON blob + image file
        await createTournament(payload, imageFile);
      }
      navigate("/tournaments");
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <Loader text="Loading tournament…" />;

  // Block non-admins from creating
  if (!isEdit && !canCreate) {
    return (
      <div className="max-w-lg">
        <div className="card text-center py-12">
          <p style={{ fontSize: "3rem" }} className="mb-3">🔒</p>
          <h2 className="text-lg font-semibold text-white mb-2">Admin Access Required</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.875rem" }} className="mb-5">
            Only administrators can create tournaments.
          </p>
          <Button variant="ghost" onClick={() => navigate("/tournaments")}>← Back to Tournaments</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl animate-in">
      {/* Header */}
      <div className="mb-6">
        <Link to="/tournaments"
          style={{ fontSize: "0.875rem", color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}
          className="hover:text-brand-400 transition-colors mb-2">
          ← Back to Tournaments
        </Link>
        <h1 className="page-title mt-1">{isEdit ? "Edit Tournament" : "New Tournament"}</h1>
        {!isEdit && (
          <p style={{ color: "#64748b", fontSize: "0.75rem", marginTop: 4 }}>
            🔒 Requires ROLE_ADMIN
          </p>
        )}
      </div>

      {error && (
        <div className="mb-5 px-4 py-3 rounded-lg text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>

          {/* Basic info */}
          <SectionTitle>Basic Information</SectionTitle>
          <Input label="Tournament Name" name="name" placeholder="Spring Football Cup 2025"
            value={form.name} onChange={handleChange} required error={errors.name} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Sport" name="sport" as="select"
              value={form.sport} onChange={handleChange} required error={errors.sport}>
              <option value="">Select sport…</option>
              {SPORT_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
            </Input>
            <Input label="Location" name="location" placeholder="Sports Arena, Building A"
              value={form.location} onChange={handleChange} />
          </div>

          <Input label="Description" name="description" as="textarea" rows={3}
            placeholder="Brief description…"
            value={form.description} onChange={handleChange} />

          {/* Dates & capacity */}
          <SectionTitle>Schedule & Capacity</SectionTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Start Date" name="startDate" type="date"
              value={form.startDate} onChange={handleChange} required error={errors.startDate} />
            <Input label="End Date" name="endDate" type="date"
              value={form.endDate} onChange={handleChange} required error={errors.endDate} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Input label="Max Teams" name="maxTeams" type="number" min="2"
              value={form.maxTeams} onChange={handleChange} />
            <Input label="Prize (USD)" name="prize" type="number" min="0"
              placeholder="0" value={form.prize} onChange={handleChange} />
          </div>

          {/* Image upload */}
          <SectionTitle>
            Tournament Image
            {!isEdit && <span style={{ color: "#f87171", marginLeft: 4 }}>*</span>}
          </SectionTitle>

          {/* Preview */}
          {(imagePreview || existingImageUrl) && (
            <div className="relative h-40 rounded-lg overflow-hidden"
              style={{ border: "1px solid #334155" }}>
              <img
                src={imagePreview || existingImageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              {imagePreview && (
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded text-xs"
                  style={{ background: "rgba(14,165,233,0.85)", color: "white" }}>
                  New image
                </span>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium" style={{ color: "#cbd5e1", display: "block", marginBottom: 6 }}>
              {isEdit ? "Replace image (optional)" : "Upload image"}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm"
              style={{ color: "#94a3b8" }}
            />
            {errors.image && <p className="text-xs mt-1" style={{ color: "#f87171" }}>{errors.image}</p>}
            {isEdit && (
              <p className="text-xs mt-1" style={{ color: "#64748b" }}>
                Leave empty to keep the existing image.
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => navigate("/tournaments")}>Cancel</Button>
            <Button type="submit" loading={loading}>
              {isEdit ? "Save Changes" : "Create Tournament"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <p style={{
      fontSize: "0.75rem", fontWeight: 600, color: "#64748b",
      textTransform: "uppercase", letterSpacing: "0.05em",
      paddingBottom: 8, borderBottom: "1px solid #334155",
    }}>
      {children}
    </p>
  );
}

export default CreateTournament;

import { useEffect, useState } from "react";
import { PageHeader } from "../components/ui/PageHeader";
import { Card } from "../components/ui/Card";
import { Field } from "../components/ui/Field";
import { SelectField } from "../components/ui/SelectField";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { LoadingBlock } from "../components/ui/LoadingBlock";
import { Alert } from "../components/ui/Alert";
import { useToast } from "../components/ui/Toast";
import { Modal } from "../components/ui/Modal";
import { useApi } from "../lib/api";
import { useSettings } from "../state/settings";

type AdminResource = {
  id: string;
  name: string;
  capacity: number;
  pricePerHour: number;
  isActive: boolean;
  location: { city: string; name: string };
  type: { code: string; name: string };
};

type Location = { id: string; name: string; city: string };
type ResourceType = { id: string; code: string; name: string };

export function AdminPage() {
  const api = useApi();
  const toast = useToast();
  const { t } = useSettings();
  const [items, setItems] = useState<AdminResource[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [types, setTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [locationId, setLocationId] = useState("");
  const [typeId, setTypeId] = useState("");
  const [name, setName] = useState("");

  useEffect(() => {
    setName((prev) => prev || t("admin.newResource"));
  }, [t]);
  const [capacity, setCapacity] = useState("4");
  const [pricePerHour, setPricePerHour] = useState("15");
  const [priceEdit, setPriceEdit] = useState<AdminResource | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [priceSaving, setPriceSaving] = useState(false);

  function load() {
    setLoading(true);
    Promise.all([
      api.get<{ items: AdminResource[] }>("/admin/resources"),
      api.get<{ items: Location[] }>("/admin/locations"),
      api.get<{ items: ResourceType[] }>("/admin/resource-types"),
    ])
      .then(([res, loc, typ]) => {
        setItems(res.items);
        setLocations(loc.items);
        setTypes(typ.items);
        if (!locationId && loc.items[0]) setLocationId(loc.items[0].id);
        if (!typeId && typ.items[0]) setTypeId(typ.items[0].id);
      })
      .catch((e: any) => setError(e?.message ?? t("common.loadError")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createResource(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api.post("/admin/resources", {
        locationId,
        typeId,
        name,
        capacity: Number(capacity),
        pricePerHour: Number(pricePerHour),
        amenities: ["Wi‑Fi"],
        isActive: true,
      });
      toast.show(t("admin.created"), "success");
      load();
    } catch (err: any) {
      toast.show(err?.message ?? t("admin.createError"), "error");
    }
  }

  function openPriceEdit(resource: AdminResource) {
    setPriceEdit(resource);
    setEditPrice(String(resource.pricePerHour));
  }

  async function savePrice(e: React.FormEvent) {
    e.preventDefault();
    if (!priceEdit) return;
    const next = Number(editPrice);
    if (!Number.isInteger(next) || next < 0) {
      toast.show(t("admin.priceInvalid"), "error");
      return;
    }
    setPriceSaving(true);
    try {
      await api.patch(`/admin/resources/${priceEdit.id}`, { pricePerHour: next });
      toast.show(t("admin.priceUpdated"), "success");
      setPriceEdit(null);
      load();
    } catch (err: any) {
      toast.show(err?.message ?? t("admin.priceError"), "error");
    } finally {
      setPriceSaving(false);
    }
  }

  async function setActive(id: string, isActive: boolean) {
    try {
      if (isActive) {
        await api.patch(`/admin/resources/${id}`, { isActive: true });
        toast.show(t("admin.activated"), "success");
      } else {
        await api.delete(`/admin/resources/${id}`);
        toast.show(t("admin.deactivated"), "info");
      }
      load();
    } catch (err: any) {
      toast.show(err?.message ?? t("common.error"), "error");
    }
  }

  return (
    <section>
      <PageHeader title={t("admin.title")} />
      {loading && <LoadingBlock />}
      {error && <Alert variant="error">{error}</Alert>}

      <Card as="section" style={{ marginBottom: 16 }}>
        <h2>{t("admin.newResource")}</h2>
        <form className="row" style={{ marginTop: 12 }} onSubmit={createResource}>
          <Field label={t("admin.name")} value={name} onChange={(e) => setName(e.target.value)} />
          <SelectField label={t("admin.location")} value={locationId} onChange={(e) => setLocationId(e.target.value)}>
            {locations.map((l) => (
              <option key={l.id} value={l.id}>
                {l.city} — {l.name}
              </option>
            ))}
          </SelectField>
          <SelectField label={t("admin.type")} value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            {types.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </SelectField>
          <Field label={t("admin.capacity")} type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} />
          <Field label={t("admin.price")} type="number" value={pricePerHour} onChange={(e) => setPricePerHour(e.target.value)} />
          <Button type="submit">{t("admin.create")}</Button>
        </form>
      </Card>

      <Card as="section">
        <h2>{t("admin.catalog")}</h2>
        <Table
          rows={items}
          rowKey={(r) => r.id}
          emptyMessage={t("admin.noResources")}
          columns={[
            { key: "name", header: t("admin.name"), render: (r) => r.name },
            { key: "loc", header: t("admin.location"), render: (r) => `${r.location.city}, ${r.location.name}` },
            { key: "type", header: t("admin.type"), render: (r) => r.type.name },
            {
              key: "price",
              header: t("admin.colPrice"),
              render: (r) => `${r.pricePerHour} ${t("common.currencyHour")}`,
            },
            {
              key: "active",
              header: t("admin.colStatus"),
              render: (r) => (r.isActive ? t("admin.active") : t("admin.inactive")),
            },
            {
              key: "actions",
              header: t("admin.colActions"),
              render: (r) => (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  <Button type="button" variant="secondary" onClick={() => openPriceEdit(r)}>
                    {t("admin.changePrice")}
                  </Button>
                  {r.isActive ? (
                    <Button type="button" variant="secondary" onClick={() => setActive(r.id, false)}>
                      {t("admin.deactivate")}
                    </Button>
                  ) : (
                    <Button type="button" variant="primary" onClick={() => setActive(r.id, true)}>
                      {t("admin.activate")}
                    </Button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </Card>

      {priceEdit && (
        <Modal
          title={t("admin.changePriceTitle")}
          subtitle={`${priceEdit.name} • ${priceEdit.location.city}, ${priceEdit.location.name}`}
          onClose={() => !priceSaving && setPriceEdit(null)}
        >
          <form className="row" style={{ marginTop: 14 }} onSubmit={savePrice}>
            <Field
              label={t("admin.price")}
              type="number"
              min={0}
              step={1}
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              required
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button type="submit" disabled={priceSaving}>
                {priceSaving ? t("common.saving") : t("common.save")}
              </Button>
              <Button type="button" variant="secondary" disabled={priceSaving} onClick={() => setPriceEdit(null)}>
                {t("common.cancel")}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}

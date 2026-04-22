"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { uploadImageToCloudflare } from "@/app/actions/uploadImageToCloudflare";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/getFullImageUrl";

// ─── Types ────────────────────────────────────────────────────────────────────

type FormValues = {
  name: string;
  established: string;
  logo: string;
  description: string;
  url: string;
  image: string;
  whatsAppNumber: string;
  email: string;
  openHours: string;
  experience: string;
  fullAddress: string;
  address: {
    city: string;
    street: string;
    district: string;
    country: string;
    postalCode: string;
  };
  phoneNumbers: { key: string; value: string }[];
  socials: { platform: string; url: string }[];
  documents: { title: string; key: string; path: string }[];
  reviews: {
    googleReview: { count: number; rating: number; link: string };
    tripadvisor: { count: number; rating: number; link: string };
  };
  gmb: { link: string; location: string };
};

const API = `${process.env.NEXT_PUBLIC_API_BASE_URL}/site-config`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function SiteConfigForm() {
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, setValue, watch } =
    useForm<FormValues>({
      defaultValues: { phoneNumbers: [], socials: [], documents: [] },
    });

  const phones = useFieldArray({ control, name: "phoneNumbers" });
  const socials = useFieldArray({ control, name: "socials" });
  const docs = useFieldArray({ control, name: "documents" });

  // ── Load ──────────────────────────────────────────────────────────────────

  async function loadConfig() {
    try {
      const res = await fetch(API);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { data } = await res.json();
      const c = data.config;

      reset({
        name: c.name ?? "",
        established: c.established ?? "",
        logo: c.logo ?? "",
        description: c.description ?? "",
        url: c.url ?? "",
        image: c.image ?? "",
        whatsAppNumber: c.whatsAppNumber ?? "",
        email: c.email ?? "",
        openHours: c.openHours ?? "",
        experience: c.experience ?? "",
        fullAddress: c.fullAddress ?? "",
        address: {
          city: c.address?.city ?? "",
          street: c.address?.street ?? "",
          district: c.address?.district ?? "",
          country: c.address?.country ?? "",
          postalCode: c.address?.postalCode ?? "",
        },
        phoneNumbers: (c.phoneNumbers ?? []).map(
          (p: Record<string, string>) => {
            const [key, value] = Object.entries(p)[0];
            return { key, value };
          },
        ),
        socials: Object.entries(c.socials ?? {}).map(([platform, url]) => ({
          platform,
          url: url as string,
        })),
        documents: Object.entries(c.documents ?? {}).map(([key, path]) => ({
          title: key,
          key,
          path: path as string,
        })),
        reviews: {
          googleReview: {
            count: c.reviews?.googleReview?.count ?? 0,
            rating: c.reviews?.googleReview?.rating ?? 0,
            link: c.reviews?.googleReview?.link ?? "",
          },
          tripadvisor: {
            count: c.reviews?.tripadvisor?.count ?? 0,
            rating: c.reviews?.tripadvisor?.rating ?? 0,
            link: c.reviews?.tripadvisor?.link ?? "",
          },
        },
        gmb: { link: c.gmb?.link ?? "", location: c.gmb?.location ?? "" },
      });
    } catch (e: any) {
      toast.error(`Failed to load: ${e.message}`);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  // ── Save ──────────────────────────────────────────────────────────────────

  async function onSubmit(values: FormValues) {
    try {
      const payload = {
        ...values,
        phoneNumbers: values.phoneNumbers.map((p) => ({ [p.key]: p.value })),
        socials: Object.fromEntries(
          values.socials.map((s) => [s.platform, s.url]),
        ),
        documents: Object.fromEntries(
          values.documents.map((d) => [d.key || d.title, d.path]),
        ),
      };

      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("Config saved successfully");
    } catch (e: any) {
      toast.error(`Save failed: ${e.message}`);
    }
  }

  // ── Upload helper ─────────────────────────────────────────────────────────

  async function handleUpload(fieldPath: string, file: File) {
    setUploadingField(fieldPath);
    try {
      const url = await uploadImageToCloudflare(file);
      setValue(fieldPath as any, url);
      toast.success("Uploaded");
    } catch (e: any) {
      toast.error(`Upload failed: ${e.message}`);
    } finally {
      setUploadingField(null);
    }
  }

  function FileUploadLabel({
    fieldPath,
    accept = "image/*",
  }: {
    fieldPath: string;
    accept?: string;
  }) {
    const busy = uploadingField === fieldPath;
    return (
      <Label
        className={`flex h-9 cursor-pointer items-center rounded-md border border-input px-3 text-xs font-medium text-muted-foreground hover:bg-muted shrink-0 ${busy ? "pointer-events-none opacity-50" : ""}`}
      >
        {busy ? "Uploading…" : "Upload"}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleUpload(fieldPath, f);
          }}
        />
      </Label>
    );
  }

  const removeBtn = (onClick: () => void) => (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="shrink-0 text-destructive hover:border-destructive"
      onClick={onClick}
    >
      ✕
    </Button>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Site configuration</h1>
          <p className="text-sm text-muted-foreground">
            Manage your site settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={loadConfig}
          >
            ↺ Refresh
          </Button>
          <Button type="submit" size="sm">
            Save changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6 w-full justify-start">
          {["general", "contact", "socials", "documents", "reviews"].map(
            (t) => (
              <TabsTrigger key={t} value={t} className="capitalize">
                {t}
              </TabsTrigger>
            ),
          )}
        </TabsList>

        {/* ── GENERAL ── */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                Brand
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Site name</Label>
                  <Input {...register("name")} placeholder="Growfore Travels" />
                </div>
                <div className="space-y-1.5">
                  <Label>Established year</Label>
                  <Input {...register("established")} placeholder="2016" />
                </div>
                <div className="space-y-1.5">
                  <Label>Logo</Label>
                  <div className="flex gap-2">
                    <Input {...register("logo")} placeholder="/logo.jpg" />
                    <FileUploadLabel fieldPath="logo" />
                  </div>
                  {watch("logo") && (
                    <img
                      src={getFullImageUrl(watch("logo"))}
                      alt="logo preview"
                      className="h-8 w-auto rounded object-contain"
                    />
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label>OG image</Label>
                  <div className="flex gap-2">
                    <Input {...register("image")} placeholder="/og.png" />
                    <FileUploadLabel fieldPath="image" />
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Input {...register("description")} placeholder="Tagline…" />
              </div>
              <div className="space-y-1.5">
                <Label>Site URL</Label>
                <Input
                  {...register("url")}
                  type="url"
                  placeholder="https://growforetravels.com"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Experience</Label>
                  <Input {...register("experience")} placeholder="20 years" />
                </div>
                <div className="space-y-1.5">
                  <Label>Open hours</Label>
                  <Input
                    {...register("openHours")}
                    placeholder="Sun–Fri 9AM–5PM NST"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── CONTACT ── */}
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                Primary contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input {...register("email")} type="email" />
                </div>
                <div className="space-y-1.5">
                  <Label>WhatsApp number</Label>
                  <Input {...register("whatsAppNumber")} placeholder="+9779…" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                Phone numbers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {phones.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    {...register(`phoneNumbers.${i}.key`)}
                    placeholder="label"
                    className="w-32 shrink-0"
                  />
                  <Input
                    {...register(`phoneNumbers.${i}.value`)}
                    placeholder="+977-…"
                  />
                  {removeBtn(() => phones.remove(i))}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => phones.append({ key: "phone", value: "" })}
              >
                + Add phone
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2 space-y-1.5">
                  <Label>Street</Label>
                  <Input {...register("address.street")} />
                </div>
                <div className="space-y-1.5">
                  <Label>City</Label>
                  <Input {...register("address.city")} />
                </div>
                <div className="space-y-1.5">
                  <Label>District</Label>
                  <Input {...register("address.district")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Country</Label>
                  <Input {...register("address.country")} />
                </div>
                <div className="space-y-1.5">
                  <Label>Postal code</Label>
                  <Input {...register("address.postalCode")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Full address (override)</Label>
                <Input {...register("fullAddress")} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── SOCIALS ── */}
        <TabsContent value="socials">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                Social media links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {socials.fields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    {...register(`socials.${i}.platform`)}
                    placeholder="facebook"
                    className="w-36 shrink-0"
                  />
                  <Input
                    {...register(`socials.${i}.url`)}
                    type="url"
                    placeholder="https://…"
                  />
                  {removeBtn(() => socials.remove(i))}
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={() => socials.append({ platform: "", url: "" })}
              >
                + Add social
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── DOCUMENTS ── */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                Certificates & documents
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {docs.fields.map((f, i) => {
                const fp = `documents.${i}.path`;
                return (
                  <div
                    key={f.id}
                    className="rounded-lg border border-border p-3 space-y-2"
                  >
                    <div className="flex gap-2">
                      <Input
                        {...register(`documents.${i}.title`)}
                        placeholder="Title"
                      />
                      <Input
                        {...register(`documents.${i}.key`)}
                        placeholder="Config key"
                      />
                      {removeBtn(() => docs.remove(i))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        {...register(fp as any)}
                        placeholder="/documents/cert.webp"
                      />
                      <FileUploadLabel fieldPath={fp} accept="image/*,.pdf" />
                    </div>
                    {watch(fp as any) && (
                      <a
                        href={watch(fp as any)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs text-blue-500 hover:underline"
                      >
                        {watch(fp as any)}
                      </a>
                    )}
                  </div>
                );
              })}
              <Button
                type="button"
                variant="ghost"
                size="lg"
                className="text-muted-foreground"
                onClick={() => docs.append({ title: "", key: "", path: "" })}
              >
                + Add document
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── REVIEWS ── */}
        <TabsContent value="reviews" className="space-y-4">
          {(
            [
              { label: "Google reviews", prefix: "reviews.googleReview" },
              { label: "TripAdvisor reviews", prefix: "reviews.tripadvisor" },
            ] as const
          ).map(({ label, prefix }) => (
            <Card key={prefix}>
              <CardHeader>
                <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Count</Label>
                    <Input
                      {...register(`${prefix}.count` as any, {
                        valueAsNumber: true,
                      })}
                      type="number"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Rating</Label>
                    <Input
                      {...register(`${prefix}.rating` as any, {
                        valueAsNumber: true,
                      })}
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Link</Label>
                    <Input
                      {...register(`${prefix}.link` as any)}
                      placeholder="#"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-widest text-muted-foreground">
                Google My Business
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>GMB link</Label>
                  <Input {...register("gmb.link")} placeholder="#" />
                </div>
                <div className="space-y-1.5">
                  <Label>Location</Label>
                  <Input {...register("gmb.location")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  );
}

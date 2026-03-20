"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import {
  User,
  Phone,
  Droplets,
  Heart,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { saveProfile } from "@/lib/actions/profile";
import { getInitials } from "@/lib/utils";

const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
  "Unknown",
];
const GENDERS = ["Male", "Female", "Non-binary", "Prefer not to say"];
const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Child",
  "Sibling",
  "Friend",
  "Guardian",
  "Other",
];

export default function ProfileClient({ userId, profile, userEmail }) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const { register, handleSubmit } = useForm({
    defaultValues: {
      full_name: profile?.full_name || "",
      date_of_birth: profile?.date_of_birth || "",
      gender: profile?.gender || "",
      nationality: profile?.nationality || "",
      phone: profile?.phone || "",
      address: profile?.address || "",
      blood_type: profile?.blood_type || "Unknown",
      emergency_contact_name: profile?.emergency_contact_name || "",
      emergency_contact_phone: profile?.emergency_contact_phone || "",
      emergency_contact_relationship:
        profile?.emergency_contact_relationship || "",
    },
  });

  const onSubmit = async (data) => {
    setSaving(true);
    const result = await saveProfile(data);
    setSaving(false);

    if (result.error) {
      toast.error(result.error);
    } else {
      setSaved(true);
      toast.success("Profile saved successfully");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  const initials = getInitials(profile?.full_name || userEmail);
  const completionFields = [
    profile?.full_name,
    profile?.date_of_birth,
    profile?.blood_type && profile.blood_type !== "Unknown",
    profile?.emergency_contact_name,
    profile?.emergency_contact_phone,
    profile?.phone,
  ];
  const completion = Math.round(
    (completionFields.filter(Boolean).length / completionFields.length) * 100,
  );

  return (
    <div className="page-container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-8"
      >
        <div className="w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center text-white font-display font-semibold text-2xl shadow-glow">
          {initials}
        </div>
        <div>
          <h2 className="font-display font-semibold text-xl text-gray-900">
            {profile?.full_name || "Your Profile"}
          </h2>
          <p className="text-sm text-gray-500">{userEmail}</p>
          <div className="flex items-center gap-2 mt-2">
            <div className="h-1.5 w-32 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {completion}% complete
            </span>
          </div>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="card p-6"
        >
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" />
            Personal Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name</label>
              <input
                {...register("full_name")}
                className="input"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input
                {...register("date_of_birth")}
                type="date"
                className="input"
              />
            </div>
            <div>
              <label className="label">Gender</label>
              <select {...register("gender")} className="input">
                <option value="">Select gender</option>
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Nationality</label>
              <input
                {...register("nationality")}
                className="input"
                placeholder="e.g. British"
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                {...register("phone")}
                type="tel"
                className="input"
                placeholder="+1 555 000 0000"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <input
                {...register("address")}
                className="input"
                placeholder="Street, City, Country"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="font-display font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Droplets className="w-4 h-4 text-red-500" />
            Medical Identifiers
          </h3>
          <label className="label">Blood Type</label>
          <div className="flex flex-wrap gap-3 mt-3">
            {BLOOD_TYPES.map((bt) => (
              <label key={bt} className="cursor-pointer">
                <input
                  {...register("blood_type")}
                  type="radio"
                  value={bt}
                  className="sr-only peer"
                />
                <div className="px-4 py-2 rounded-xl border-2 border-gray-200 text-center text-sm font-semibold text-gray-600 peer-checked:border-red-400 peer-checked:bg-red-50 peer-checked:text-red-700 hover:border-gray-300 transition-all cursor-pointer min-w-[3rem] flex items-center justify-center">
                  {bt}
                </div>
              </label>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card p-6"
        >
          <h3 className="font-display font-semibold text-gray-900 mb-1 flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            Emergency Contact
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            This information appears on your emergency profile
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Contact Name</label>
              <input
                {...register("emergency_contact_name")}
                className="input"
                placeholder="Jane Doe"
              />
            </div>
            <div>
              <label className="label">Relationship</label>
              <select
                {...register("emergency_contact_relationship")}
                className="input"
              >
                <option value="">Select relationship</option>
                {RELATIONSHIPS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Contact Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  {...register("emergency_contact_phone")}
                  type="tel"
                  className="input pl-10"
                  placeholder="+1 555 000 0000"
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className="btn-primary px-8">
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saved ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}

import SignUpForm from "@/components/forms/SignUpForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up & Personalize",
    description: "Create your PulseQuant account and tailor your investment dashboard.",
};

export default function SignUpPage() {
    return <SignUpForm />;
}

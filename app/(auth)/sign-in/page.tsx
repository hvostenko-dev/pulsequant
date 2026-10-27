import SignInForm from "@/components/forms/SignInForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In",
    description: "Sign in to access your PulseQuant institutional terminal.",
};

export default function SignInPage() {
    return <SignInForm />;
}

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import InputField from "@/components/forms/InputField";
import FooterLink from "@/components/forms/FooterLink";
import { signInWithEmail } from "@/lib/actions/auth.actions";

const SignIn = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: {
            errors,
            isSubmitting,
        },
    } = useForm<SignInFormData>({
        defaultValues: {
            email: "",
            password: "",
        },
        mode: "onBlur",
    });

    const onSubmit = async (data: SignInFormData) => {
        try {
            const result = await signInWithEmail(data);

            if (!result.success) {
                toast.error("Sign in failed", {
                    description:
                        result.error || "Failed to sign in.",
                });

                return;
            }

            toast.success("Welcome back!");

            router.replace("/");
            router.refresh();
        } catch (error) {
            console.error("SIGN_IN_FORM_ERROR:", error);

            toast.error("Sign in failed", {
                description:
                    error instanceof Error
                        ? error.message
                        : "Failed to sign in.",
            });
        }
    };

    return (
        <>
            <h1 className="form-title">
                Welcome back
            </h1>

            <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
                noValidate
            >
                <InputField
                    name="email"
                    label="Email"
                    placeholder="investor@pulsequant.io"
                    type="email"
                    register={register}
                    error={errors.email}
                    validation={{
                        required: "Email is required",
                        pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Enter a valid email address",
                        },
                    }}
                />

                <InputField
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    register={register}
                    error={errors.password}
                    validation={{
                        required: "Password is required",
                        minLength: {
                            value: 8,
                            message:
                                "Password must be at least 8 characters",
                        },
                    }}
                />

                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="yellow-btn mt-5 w-full"
                >
                    {isSubmitting
                        ? "Signing In..."
                        : "Sign In"}
                </Button>

                <FooterLink
                    text="Don't have an account?"
                    linkText="Create an account"
                    href="/sign-up"
                />
            </form>
        </>
    );
};

export default SignIn;
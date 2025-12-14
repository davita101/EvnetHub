import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { loginConstant } from "@/constants";
import { useMutation } from "@tanstack/react-query";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [userInfo, setUserInfo] = useState<{
    email: string;
    password: string;
  }>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  // ! AUTH
  const { mutate: handleLogin, isPending } = useMutation({
    mutationFn: async () => {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: userInfo.email,
          password: userInfo.password,
        }),
        credentials: "include",
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Login failed");
      }
      return response.json();
    },
    onSuccess: () => {
      window.location.reload(); // ✅ after success
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });
  return (
    <div className="flex items-center justify-center h-screen max-w-130  mx-auto ">
      <div className={cn("flex flex-col gap-6 w-full", className)} {...props}>
        <Card className="overflow-hidden p-0">
          <CardContent className="grid p-0">
            <form className="p-6 md:p-8">
              <FieldGroup>
                <div className="flex flex-col items-center gap-2 text-center">
                  <h1 className="text-2xl font-bold">
                    {loginConstant.heading1}
                  </h1>
                </div>
                {isPending && <p className="text-center text-sm text-gray-500">Loading...</p>}
                {error && <p className="text-center text-sm text-red-500">{error}</p>}
                <Field>
                  <Input
                    id="email"
                    type="email"
                    value={userInfo.email}
                    onChange={(e) =>
                      setUserInfo({
                        ...userInfo,
                        email: e.target.value,
                      })
                    }
                    placeholder={loginConstant.email}
                    required
                  />
                </Field>
                <Field>
                  <Input
                    value={userInfo.password}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setUserInfo({
                        ...userInfo,
                        password: e.target.value,
                      })
                    }
                    placeholder={loginConstant.passwd}
                    id="password"
                    type="password"
                    required
                  />
                </Field>
                <Field>
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      handleLogin();
                    }}
                    type="submit"
                    disabled={isPending}
                  >
                    {isPending ? "Logging in..." : loginConstant.logIn}
                  </Button>
                </Field>
                <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                  {loginConstant.or}
                </FieldSeparator>
                <Field className="grid grid-cols-1">
                  <Button variant="outline" type="button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Login with Google</span>
                  </Button>
                </Field>
                <FieldDescription className="text-center">
                  {loginConstant.signUpIntro}{" "}
                  <a href="/register">{loginConstant.signUp}</a>
                </FieldDescription>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

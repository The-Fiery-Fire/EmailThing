'use client'

import { Button } from "@/components/ui/button";
import { CheckIcon, Loader2 } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { toast } from "sonner";
import { emailMeForm } from "./action";
import { ClientInput, ClientTextarea } from "@/(user)/components.client";

export function Form({ publicEmail, username }: { className?: string, publicEmail?: string, username?: string }) {
    const [state, formAction] = useFormState(emailMeForm, {})

    useEffect(() => {
        if (state?.error) {
            (window as any)?.turnstile?.reset()
        }
    }, [state])

    return (
        <>
            <form action={formAction} className="flex flex-col gap-2 max-w-[35rem] self-center w-full" suppressHydrationWarning>
                <input name="username" value={username} hidden />
                <div className="flex gap-2 sm:flex-row flex-col">
                    <ClientInput placeholder="Name" className="w-full sm:w-1/2 border-none bg-secondary" name="name" autoComplete="name" disabled={!!state?.success} />
                    <ClientInput placeholder="Email" className="w-full sm:w-1/2 border-none bg-secondary" name="email" type="email" disabled={!!state?.success} />
                </div>
                <ClientInput placeholder="Subject" className="w-full border-none bg-secondary" name="subject" disabled={!!state?.success} />
                <ClientTextarea placeholder="Message... *" className="w-full border-none bg-secondary" rows={7} required name="message" disabled={!!state?.success} />

                <div className="flex mt-2 sm:mt-1 sm:h-10 items-center flex-col-reverse sm:flex-row gap-3" suppressHydrationWarning>
                    <div suppressHydrationWarning className="flex flex-col">
                        <div className="cf-turnstile [&>*]:mb-2 [&>*]:sm:mt-12 [&>*]:sm:mx-1" data-sitekey="0x4AAAAAAAb9U2XXs4z4cJUN" suppressHydrationWarning hidden={!!state?.success}></div>
                        {/* <div className="cf-turnstile [&>*]:mb-2 [&>*]:sm:mt-12 [&>*]:sm:mx-1" data-sitekey="3x00000000000000000000FF" suppressHydrationWarning hidden={!!state?.success}></div> */}
                        <script defer src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=managed" />

                        {state?.error ? (
                            <p className="text-red justify-center text-sm">{state.error}</p>
                        ) : (
                            <p className="text-muted-foreground justify-center text-sm overflow-auto">
                                You can also email <a href={`mailto:${publicEmail}`} className="font-bold hover:underline">{publicEmail}</a>
                            </p>
                        )}
                    </div>
                    <SendButton success={!!state?.success} />
                </div>
            </form >
            <Toaster message={state?.success} />
        </>
    );
}

function SendButton({ success }: { success?: boolean }) {
    const state = useFormStatus()
    return (
        <Button type="submit" className="w-full sm:w-min sm:ms-auto px-7 flex gap-2" disabled={state.pending || success} >
            {state.pending && <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />}
            {success && <CheckIcon className="w-5 h-5 text-green-500 -ms-1" />}
            {success ? "Sent Message" : "Send Message"}
        </Button>
    )
}

function Toaster({ message }: { message?: string }) {
    const state = useFormStatus()
    useEffect(() => {
        if (!state.pending && message) {
            toast.success(message)
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.pending])
    return <></>
}

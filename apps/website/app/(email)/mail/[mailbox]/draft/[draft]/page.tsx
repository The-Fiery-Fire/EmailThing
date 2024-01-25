import { prisma } from "@email/db"
import { BodyEditor, FromInput, RecipientInput, SendButton, Subject } from "./editor.client"
import { notFound } from "next/navigation"
import { mailboxAliases, pageMailboxAccess } from "../../tools"
import { saveDraftAction, sendEmailAction } from "./actions"
import { Recipient } from "./types"
import { cache } from "react"

export async function generateMetadata(props: { params: { mailbox: string, draft: string } }) {
    await pageMailboxAccess(props.params.mailbox)
    const mail = await fetchDraft(props.params.mailbox, props.params.draft)
    return {
        title: mail?.subject || "(Unnamed draft)",
    }
}

const fetchDraft = cache(async (mailboxId: string, draftId: string) => {
    return await prisma.draftEmail.findFirst({
        where: {
            id: draftId,
            mailboxId: mailboxId,
        },
        select: {
            body: true,
            subject: true,
            from: true,
            to: true
        }
    })
})



export default async function DraftPage({
    params
}: {
    params: {
        mailbox: string,
        draft: string
    }
}) {
    await pageMailboxAccess(params.mailbox)

    const { aliases, default: defaultAlias } = await mailboxAliases(params.mailbox)

    const mail = await fetchDraft(params.mailbox, params.draft)
    if (!mail) return notFound()


    const saveAction = saveDraftAction.bind(null, params.mailbox, params.draft)
    const sendAction = sendEmailAction.bind(null, params.mailbox, params.draft)

    const to = mail.to ? JSON.parse(mail.to) as Recipient[] : undefined

    let isValid = null;
    if (!mail.subject) {
        isValid = "Subject is required";
    } else if (!mail.body) {
        isValid = "Body is required";
    } else if (!mail.from) {
        isValid = "From is required";
    } else if (!to || [...to].filter(e => !e.cc).length <= 0) {
        isValid = "At least one recipient is required";
    }

    return (
        <div className="w-full p-4 md:p-8 gap-4 flex flex-col">
            <div className="flex items-center gap-4">
                <SendButton sendAction={sendAction} isValid={isValid} />
                <FromInput savedAlias={mail.from || defaultAlias?.alias} aliases={aliases} saveAction={saveAction} />
            </div>

            <RecipientInput savedTo={to} saveAction={saveAction} />
            <Subject savedSubject={mail.subject ?? undefined} saveAction={saveAction} />
            <br className="h-4" />
            <BodyEditor savedBody={mail.body ?? undefined} saveAction={saveAction} />
        </div>
    )
}
/**
 * The Contact form: POST /api/contact/messages. The message is saved in the admin inbox; the owner is emailed when
 * email is switched on.
 */
import { post } from '../client'
import type { SendContactMessageCommand } from '../contracts/commands'

/** Sends the form. */
export const sendContactMessage = (command: SendContactMessageCommand) => post('api/contact/messages', command)

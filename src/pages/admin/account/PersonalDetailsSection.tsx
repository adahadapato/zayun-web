import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { ApiError, unwrap } from '../../../api/apiError'
import type { AddressDto, PersonalDetailsDto, PhoneDto } from '../../../api/contracts/dtos'
import { getPersonalDetails, savePersonalDetails } from '../../../api/services/adminService'
import { Button } from '../../../components/ui/Button'
import { Field, Toggle } from '../../../components/ui/Field'
import { ListStatus } from '../../../components/ui/ListStatus'
import { StatusBanner } from '../../../components/ui/StatusBanner'
import styles from '../Admin.module.css'
import { useSavedFlag } from '../useSavedFlag'

const key = ['admin', 'personal-details'] as const
const MAX_PHONES = 6
const MAX_ADDRESSES = 5

const newPhone = (): PhoneDto => ({ label: '', number: '', showOnWebsite: false })
const newAddress = (): AddressDto => ({
  label: 'Home', line1: '', line2: '', city: '', region: '', postcode: '', country: '', showOnWebsite: false,
})

/**
 * Account → Personal details: the name and headline on the website, a public email, phone numbers and addresses.
 * Everything is private unless switched on; a shown address only shows its town and country.
 */
export function PersonalDetailsSection() {
  const details = useQuery({
    queryKey: key,
    queryFn: async ({ signal }) => unwrap(await getPersonalDetails(signal)),
  })

  return (
    <section className={styles.panel} aria-labelledby="personal">
      <div className={styles.panelHead}>
        <div>
          <h2 id="personal">Personal details</h2>
          <p>Private unless you switch them on. A shown address only shows its town and country, never the street.</p>
        </div>
      </div>
      <ListStatus isLoading={details.isLoading} error={details.error} isEmpty={false} emptyText=""
                  onRetry={() => details.refetch()} placeholders={2} />
      {/* Filled once from the first load; after a save the form already holds what was saved */}
      {details.data && <DetailsForm initial={details.data} />}
    </section>
  )
}

function DetailsForm({ initial }: { initial: PersonalDetailsDto }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<PersonalDetailsDto>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [saved, flagSaved] = useSavedFlag()

  const err = (name: string) => error?.fieldError(name)
  const setPhone = (i: number, patch: Partial<PhoneDto>) =>
    setForm((f) => ({ ...f, phones: f.phones.map((p, j) => (j === i ? { ...p, ...patch } : p)) }))
  const setAddress = (i: number, patch: Partial<AddressDto>) =>
    setForm((f) => ({ ...f, addresses: f.addresses.map((a, j) => (j === i ? { ...a, ...patch } : a)) }))

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setError(null)
    const blank = (v: string | null) => v?.trim() || null
    const result = await savePersonalDetails({
      fullName: form.fullName.trim(),
      headline: blank(form.headline),
      publicEmail: blank(form.publicEmail),
      phones: form.phones.filter((p) => p.number.trim() || p.label.trim()),
      addresses: form.addresses
        .filter((a) => a.line1.trim() || a.city.trim() || a.country.trim())
        .map((a) => ({ ...a, line2: blank(a.line2), region: blank(a.region), postcode: blank(a.postcode) })),
    })
    setBusy(false)
    if (!result.ok) {
      setError(result.error)
      return
    }
    setForm(result.value)   // drops empty rows that weren't saved
    queryClient.setQueryData(key, result.value)
    void queryClient.invalidateQueries({ queryKey: ['content', 'personal-details'] })
    flagSaved()
  }

  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <div className={styles.grid2}>
        <Field label="Name shown on the website" value={form.fullName} maxLength={120}
               onChange={(e) => setForm({ ...form, fullName: e.target.value })} error={err('fullName')} />
        <Field label="Headline" optional value={form.headline ?? ''} maxLength={160}
               onChange={(e) => setForm({ ...form, headline: e.target.value })} error={err('headline')}
               placeholder="Software Engineer and AI Researcher" hint="One line about you, for search engines." />
        <Field label="Public email" optional type="email" value={form.publicEmail ?? ''} maxLength={256}
               onChange={(e) => setForm({ ...form, publicEmail: e.target.value })} error={err('publicEmail')}
               hint="Shown on the Contact page. Leave empty to hide it." className={styles.span2} />
      </div>

      {/* ── Phones ── */}
      <fieldset className={styles.subList}>
        <legend>Phone numbers <span className={styles.muted}>({form.phones.length} of {MAX_PHONES})</span></legend>
        {form.phones.map((p, i) => (
          <div key={i} className={styles.subRow}>
            <div className={styles.grid3} style={{ alignItems: 'end' }}>
              <Field label="Label" value={p.label} maxLength={40} placeholder="UK, Nigeria, Mobile…"
                     onChange={(e) => setPhone(i, { label: e.target.value })} error={err(`phones[${i}].label`)} />
              <Field label="Number" type="tel" value={p.number} maxLength={30} placeholder="+44 7881 186690"
                     onChange={(e) => setPhone(i, { number: e.target.value })} error={err(`phones[${i}].number`)} />
              <div className={styles.actions} style={{ minHeight: 46 }}>
                <Toggle label="On the website" checked={p.showOnWebsite} onChange={(v) => setPhone(i, { showOnWebsite: v })} />
                <Button variant="plain" small onClick={() => setForm({ ...form, phones: form.phones.filter((_, j) => j !== i) })}>
                  Remove
                </Button>
              </div>
            </div>
          </div>
        ))}
        {form.phones.length < MAX_PHONES && (
          <div><Button variant="secondary" small onClick={() => setForm({ ...form, phones: [...form.phones, newPhone()] })}>
            + Add a phone number
          </Button></div>
        )}
      </fieldset>

      {/* ── Addresses ── */}
      <fieldset className={styles.subList}>
        <legend>Addresses <span className={styles.muted}>({form.addresses.length} of {MAX_ADDRESSES})</span></legend>
        {form.addresses.map((a, i) => (
          <div key={i} className={styles.subRow}>
            <div className={styles.grid3}>
              <Field label="Label" value={a.label} maxLength={40} placeholder="Home, Office…"
                     onChange={(e) => setAddress(i, { label: e.target.value })} error={err(`addresses[${i}].label`)} />
              <Field className={styles.span2} label="Address line 1" value={a.line1} maxLength={200}
                     onChange={(e) => setAddress(i, { line1: e.target.value })} error={err(`addresses[${i}].line1`)} />
              <Field label="Address line 2" optional value={a.line2 ?? ''} maxLength={200}
                     onChange={(e) => setAddress(i, { line2: e.target.value })} />
              <Field label="Town or city" value={a.city} maxLength={100}
                     onChange={(e) => setAddress(i, { city: e.target.value })} error={err(`addresses[${i}].city`)} />
              <Field label="County or state" optional value={a.region ?? ''} maxLength={100}
                     onChange={(e) => setAddress(i, { region: e.target.value })} />
              <Field label="Postcode" optional value={a.postcode ?? ''} maxLength={20}
                     onChange={(e) => setAddress(i, { postcode: e.target.value })} />
              <Field label="Country" value={a.country} maxLength={100}
                     onChange={(e) => setAddress(i, { country: e.target.value })} error={err(`addresses[${i}].country`)} />
            </div>
            <div className={styles.actions}>
              <Toggle label="Show the town and country on the website" checked={a.showOnWebsite}
                      onChange={(v) => setAddress(i, { showOnWebsite: v })}
                      hint={a.showOnWebsite && a.city && a.country ? `Visitors see: ${a.city}, ${a.country}` : 'Kept private.'} />
              <Button variant="plain" small
                      onClick={() => setForm({ ...form, addresses: form.addresses.filter((_, j) => j !== i) })}>
                Remove
              </Button>
            </div>
          </div>
        ))}
        {form.addresses.length < MAX_ADDRESSES && (
          <div><Button variant="secondary" small onClick={() => setForm({ ...form, addresses: [...form.addresses, newAddress()] })}>
            + Add an address
          </Button></div>
        )}
      </fieldset>

      {error && <StatusBanner message={Object.keys(error.fieldErrors).length ? 'Please check the fields marked in red.'
        : error.displayMessage} isError />}
      {saved && <StatusBanner message="Saved." />}

      <div className={styles.actions}>
        <Button type="submit" busy={busy} busyText="Saving…">Save details</Button>
      </div>
    </form>
  )
}

# Ticket worker: securitized-product trade capture

Build the complete accessible ticket component for the synthetic
`/trade-capture` workspace. Read the product brief and frozen contract first.
The prop types are stable and domain/state logic belongs elsewhere.

You may change only:

- `app/trade-capture/components/trade-ticket.tsx`

## Required behavior

- Render all editable `TradeDraft` fields except the internal trade ID and
  read-only allocations. Group identity, economics, product detail, and notes
  with semantic `fieldset` and `legend` elements.
- Use the frozen `tc-field-{field}` ID for every control. Labels must be
  explicitly associated with controls.
- Show each supplied exception beside its field using
  `tc-error-{field}`. Error controls use `aria-invalid`; controls with messages
  use `aria-describedby`. Warnings remain visible without marking the field
  invalid.
- Numeric inputs convert an empty string to `null`; otherwise pass a finite
  number. The component updates only through `onChange` and does not calculate
  or validate.
- Use the exact six product values, two sides, and five modifier values from
  the domain contract. Currency is visible as fixed USD.
- Provide real `type="button"` actions for save draft, validate, book, and
  reset. Disable Book whenever any supplied exception has severity `error` and
  show a plain visible reason. Warnings must not disable Book.
- Preserve the existing `.tc-` class convention. Do not add inline styles,
  domain imports, state, dependencies, or network behavior.

Run only `npm run typecheck` and `npm run lint`. In the final response, report
the changed file and check results. Do not claim browser verification.

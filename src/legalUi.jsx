export function LegalTable({ caption, columns, rows }) {
  const lead = columns[0];
  return (
    <div className="legal-scroll">
      <table className="legal-table">
        <caption>{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} scope="col">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={String(row[lead.key])}>
              {columns.map((col, index) =>
                index === 0 ? (
                  <th key={col.key} scope="row" data-label={col.label}>
                    {row[col.key]}
                  </th>
                ) : (
                  <td key={col.key} data-label={col.label}>
                    {row[col.key]}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function LegalSection({ id, title, paragraphs, list, children }) {
  return (
    <section id={id}>
      <h2>{title}</h2>
      {(paragraphs || []).map((text) => (
        <p key={text}>{text}</p>
      ))}
      {list?.length ? (
        <ul>
          {list.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
      {children}
    </section>
  );
}

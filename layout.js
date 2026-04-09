export const metadata = { title: 'FlightHacker AI', description: 'Nejlepší ceny letenek' }
export default function RootLayout({ children }) {
  return (
    <html lang="cs">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  )
}

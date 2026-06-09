import { Helmet } from 'react-helmet-async'

interface SeoHeadProps {
  title: string
  description?: string
}

const SITE_NAME = 'AxisERP'

export function SeoHead({ title, description }: SeoHeadProps) {
  const fullTitle = `${title} | ${SITE_NAME}`

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && (
        <>
          <meta name="description" content={description} />
          <meta property="og:description" content={description} />
          <meta name="twitter:description" content={description} />
        </>
      )}
      <meta property="og:title" content={fullTitle} />
      <meta name="twitter:title" content={fullTitle} />
    </Helmet>
  )
}

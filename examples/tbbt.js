const Client = require('../ParsingClient')

async function main () {
  const client = new Client({
    bin: '/home/bergi/opt/apache-jena/bin',
    db: 'tbbt-db'
  })

  await client.endpoint.importFiles([require.resolve('tbbt-ld/dist/tbbt.nt')])

  const result = await client.query.select(`
    PREFIX s: <http://schema.org/>
  
    SELECT ?givenName ?familyName {
      ?person s:address ?address.
      ?address s:streetAddress "2311 North Los Robles Avenue, Aparment 4A".
      
      ?person
        s:givenName ?givenName;
        s:familyName ?familyName.
    }
  `)

  console.log(result)
}

main()

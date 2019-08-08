const Tdb = require('..')

async function main () {
  const tdb = new Tdb({
    jenaBinPath: '/home/bergi/opt/apache-jena/bin',
    tdbPath: 'tbbt-db'
  })

  await tdb.importFiles([require.resolve('tbbt-ld/dist/tbbt.nt')])

  const result = await tdb.selectQuery(`
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

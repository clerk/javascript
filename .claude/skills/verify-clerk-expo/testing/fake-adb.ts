console.log(JSON.stringify({ args: process.argv.slice(2) }));
process.exit(process.argv.includes('fails') ? 3 : 0);

require('dotenv').config()

function inspect(name) {
    const val = process.env[name]
    if (!val) {
        console.log(`${name}: NOT SET`)
        return
    }
    const lines = val.split('\n')
    console.log(`${name}:`)
    console.log(`  length: ${val.length}`)
    console.log(`  number of real newlines: ${lines.length - 1}`)
    console.log(`  contains literal backslash-n (\\n as text): ${val.includes('\\n')}`)
    console.log(`  starts with: "${val.slice(0, 30)}"`)
    console.log(`  ends with: "${val.slice(-30)}"`)
    console.log(`  first line: "${lines[0]}"`)
    console.log(`  last line: "${lines[lines.length - 1]}"`)
    console.log('')
}

inspect('GRIEVANCE_MASTER_PUBLIC_KEY')
inspect('GRIEVANCE_MASTER_PRIVATE_KEY')
import fs from 'fs';
import solc from 'solc';
import path from 'path';

function compileContract() {
    console.log('🔧 Compiling Guestbook contract...');

    // Read the contract source code
    const contractPath = path.join(process.cwd(), 'contracts', 'Guestbook.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Prepare the input for the Solidity compiler
    const input = {
        language: 'Solidity',
        sources: {
            'Guestbook.sol': {
                content: source,
            },
        },
        settings: {
            outputSelection: {
                '*': {
                    '*': ['*'],
                },
            },
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    };

    try {
        // Compile the contract
        const output = JSON.parse(solc.compile(JSON.stringify(input)));

        // Check for compilation errors
        if (output.errors) {
            output.errors.forEach((error) => {
                if (error.severity === 'error') {
                    console.error('❌ Compilation error:', error.formattedMessage);
                    return;
                } else {
                    console.warn('⚠️  Warning:', error.formattedMessage);
                }
            });
        }

        // Get the compiled contract
        const contract = output.contracts['Guestbook.sol']['Guestbook'];
        
        if (!contract) {
            console.error('❌ Contract not found in compilation output');
            return;
        }

        console.log('✅ Contract compiled successfully!');
        
        // Extract bytecode and ABI
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;

        console.log('📝 Bytecode length:', bytecode.length);
        console.log('📋 ABI methods:', abi.length);

        // Save compilation output
        const compilationOutput = {
            bytecode: '0x' + bytecode,
            abi: abi,
            contractName: 'Guestbook'
        };

        fs.writeFileSync('compilation-output.json', JSON.stringify(compilationOutput, null, 2));
        console.log('💾 Compilation output saved to compilation-output.json');

        return compilationOutput;

    } catch (error) {
        console.error('❌ Compilation failed:', error.message);
        return null;
    }
}

// Run compilation
const result = compileContract();
if (result) {
    console.log('🎉 Ready for deployment!');
} else {
    console.log('💥 Compilation failed');
    process.exit(1);
}
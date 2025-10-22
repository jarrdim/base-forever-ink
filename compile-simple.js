import fs from 'fs';
import solc from 'solc';
import path from 'path';

function compileSimpleContract() {
    console.log('🔧 Compiling SimpleGuestbook contract...');

    // Read the contract source code
    const contractPath = path.join(process.cwd(), 'contracts', 'SimpleGuestbook.sol');
    const source = fs.readFileSync(contractPath, 'utf8');

    // Prepare the input for the Solidity compiler
    const input = {
        language: 'Solidity',
        sources: {
            'SimpleGuestbook.sol': {
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
        const contract = output.contracts['SimpleGuestbook.sol']['SimpleGuestbook'];

        if (!contract) {
            console.error('❌ Contract not found in compilation output');
            return;
        }

        // Extract bytecode and ABI
        const bytecode = contract.evm.bytecode.object;
        const abi = contract.abi;

        // Save compilation output
        const compilationOutput = {
            bytecode: `0x${bytecode}`,
            abi: abi,
        };

        fs.writeFileSync('simple-compilation-output.json', JSON.stringify(compilationOutput, null, 2));

        console.log('✅ SimpleGuestbook contract compiled successfully!');
        console.log('📄 Compilation output saved to simple-compilation-output.json');
        console.log('📊 Contract size:', Math.round(bytecode.length / 2), 'bytes');

    } catch (error) {
        console.error('❌ Compilation failed:', error.message);
        process.exit(1);
    }
}

compileSimpleContract();
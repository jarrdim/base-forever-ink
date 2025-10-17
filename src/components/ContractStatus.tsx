import { AlertCircle, CheckCircle, ExternalLink } from "lucide-react";
import { GUESTBOOK_CONTRACT_ADDRESS } from "@/lib/contract";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export const ContractStatus = () => {
  const isDeployed = GUESTBOOK_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000";
  
  if (isDeployed) {
    return (
      <Alert className="glass border-primary/30 max-w-2xl mx-auto mb-8">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary">Contract Deployed ✓</AlertTitle>
        <AlertDescription className="text-muted-foreground">
          All messages are permanently stored on Base blockchain.{' '}
          <a 
            href={`https://basescan.org/address/${GUESTBOOK_CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline inline-flex items-center gap-1"
          >
            View Contract <ExternalLink className="h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="glass border-destructive/30 max-w-2xl mx-auto mb-8">
      <AlertCircle className="h-4 w-4 text-destructive" />
      <AlertTitle className="text-destructive">Contract Not Deployed</AlertTitle>
      <AlertDescription className="text-muted-foreground space-y-2">
        <p>To enable blockchain storage, deploy the smart contract:</p>
        <ol className="list-decimal list-inside space-y-1 text-sm ml-2">
          <li>Check the <code className="text-primary">contracts/</code> folder for the Solidity code</li>
          <li>Deploy using Remix, Hardhat, or Foundry (see contracts/README.md)</li>
          <li>Update <code className="text-primary">src/lib/contract.ts</code> with your contract address</li>
        </ol>
        <p className="text-xs mt-2">
          The guestbook will work with localStorage until the contract is deployed.
        </p>
      </AlertDescription>
    </Alert>
  );
};

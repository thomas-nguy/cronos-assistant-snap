/* eslint-disable */
import type { OnTransactionHandler, OnInstallHandler, OnHomePageHandler, OnSignatureHandler } from '@metamask/snaps-sdk';

import { onHomePageContent, errorContent, notSupportedChainContent } from './utils/content';
import { Box, Text, Banner} from '@metamask/snaps-sdk/jsx';
import { riskLevelToBannerValues } from './utils/utilFunctions';

// Called during after installation. Show install instructions and links
export const onInstall: OnInstallHandler = async () => {
	//await runInstaller();
};

// Called during a signature request transaction. Show insights
export const onSignature: OnSignatureHandler = async ({ signature, signatureOrigin }) => {
	try {
		const [severity, title, description] = riskLevelToBannerValues(0);
		return {
			content: (
				<Box>
					<Banner title={title} severity={severity}>
						<Text>{description}</Text>
					</Banner>
				</Box>
			),
		};
	} catch (error) {
		console.error('OnSignature Error', error);
		return { content: errorContent };
	}
};

// Called when a transaction is pending. Handle outgoing transactions.
export const onTransaction: OnTransactionHandler = async ({ transaction, chainId, transactionOrigin }) => {
	try {
		const chainNumber = chainId.split(':')[1];
		if (chainNumber == '25' || chainNumber == '338') {
			const [severity, title, description] = riskLevelToBannerValues(0);
			return {
				content: (
					<Box>
						<Banner title={title} severity={severity}>
							<Text>{description}</Text>
						</Banner>
					</Box>
				),
			};
		} else {
			return {
				content: (
					<Box>
						{notSupportedChainContent}
					</Box>
				),
			};
		}
	} catch (error) {
		console.error('Error in onTransaction. Could not retrieve user persisted key');
		return {
			content: errorContent,
		};
	}
};

export const onHomePage: OnHomePageHandler = async () => {
	return {
		content: <Box>{onHomePageContent}</Box>,
	};
};

/* eslint-disable */
import type { OnTransactionHandler, OnInstallHandler, OnHomePageHandler, OnSignatureHandler, OnRpcRequestHandler } from '@metamask/snaps-sdk';

import { onHomePageContent, errorContent, notSupportedChainContent, noContent } from './utils/content';
import { Box, Text, Banner} from '@metamask/snaps-sdk/jsx';
import { findScenarios, scenariosLevelToBannerValues } from './utils/utilFunctions';

// Called during after installation. Show install instructions and links
export const onInstall: OnInstallHandler = async () => {
	//await runInstaller();
};

// Called during a signature request transaction. Show insights
export const onSignature: OnSignatureHandler = async ({ signature, signatureOrigin }) => {
	try {
		const banners = scenariosLevelToBannerValues([0]);
		return {
			content: (
				<Box>
					{banners.map((banner, index) => (
						<Banner// better to use a unique id if available
							title={banner[1]}
							severity={banner[0]}
						>
							<Text>{banner[2]}</Text>
						</Banner>
					))}
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
			let scenarios = findScenarios(transaction, chainId, transactionOrigin);
			const banners = scenariosLevelToBannerValues(scenarios);

			return {
				content: (
					<Box>
						{banners.map((banner, index) => (
							<Banner// better to use a unique id if available
								title={banner[1]}
								severity={banner[0]}
							>
								<Text>{banner[2]}</Text>
							</Banner>
						))}
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

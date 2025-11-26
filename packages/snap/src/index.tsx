/* eslint-disable */
import type { OnTransactionHandler, OnInstallHandler, OnHomePageHandler, OnSignatureHandler } from '@metamask/snaps-sdk';

import { onInstallContent, onHomePageContent, errorContent, notSupportedChainContent } from './utils/content';
import { runInstaller } from './utils/installer';
import { callDomainSecurity } from './features/DomainCheck';
import { callTransactionSimulation } from './features/SimulationCheck';

import { callTransactionInsight } from './features/TransactionInsight';
import { parseSignature } from './features/SignatureCheck';
import { Box, Heading, Text, Bold, Divider, Banner, Link, Container, Footer, Button, Row, Address, Section, Value } from '@metamask/snaps-sdk/jsx';
import { riskLevelToBannerValues } from './utils/utilFunctions';
import { chainIdHexToNumber } from './utils/utilFunctions';
import { addressPoisoningDetection } from './features/AddressPoisoning';

// Called during after installation. Show install instructions and links
export const onInstall: OnInstallHandler = async () => {
	//await runInstaller();
};

// Called during a signature request transaction. Show insights
export const onSignature: OnSignatureHandler = async ({ signature, signatureOrigin }) => {
	//console.log('onSignature', JSON.stringify(signature), signatureOrigin);
	let signatureContent = null;
	let signatureRiskScore = 0;
	try {
		const persistedUserData = await snap.request({
			method: 'snap_manageState',
			params: { operation: 'get' },
		});
		// If no persisted data, return error content immediately
		if (persistedUserData === null) {
			console.error('Error retrieving persisted user data');
			return null;
		}

		const chainId = await ethereum.request({ method: 'eth_chainId' });
		const chainNumber = chainIdHexToNumber(chainId as string);

		// Only support Cronos
		const [domainSecurityContent, domainRiskScore] = await callDomainSecurity(signatureOrigin);

		const [severity, title, description] = riskLevelToBannerValues(0);

		// Create array of content with their risk scores for sorting
		const contentWithScores = [
			{ content: domainSecurityContent, score: domainRiskScore },
			{ content: signatureContent, score: signatureRiskScore },
		].filter((item) => item.content !== null); // Filter out null content

		// Sort by risk score in descending order
		const sortedContent = contentWithScores.sort((a, b) => b.score - a.score).map((item) => item.content);

		return {
			content: (
				<Box>
					<Banner title={title} severity={severity}>
						<Text>{description}</Text>
					</Banner>
					{sortedContent}
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
			const [
				[domainSecurityContent, domainRiskScore],
				[transactionInsightContent, insightRiskScore],
			] = await Promise.all([
				callDomainSecurity(transactionOrigin),
				callTransactionInsight(),
			]);

			const [severity, title, description] = riskLevelToBannerValues(0);
			// Create array of content with their risk scores for sorting
			const contentWithScores = [
				{ content: domainSecurityContent, score: domainRiskScore },
				{ content: transactionInsightContent, score: insightRiskScore },
			].filter((item) => item.content !== null); // Filter out null content

			// Sort by risk score in descending order
			// Transaction Simulation Content will always be the last content
			// The other content will be sorted by risk score in descending order
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

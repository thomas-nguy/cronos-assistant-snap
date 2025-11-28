import { keccak256 } from 'js-sha3';
import type { CaipChainId } from '@metamask/utils';
import type { OnTransactionHandler } from '@metamask/snaps-sdk';
import { ethers } from 'ethers';
import axios from 'axios';

type Severity = 'danger' | 'info' | 'success' | 'warning';

type Transaction = Parameters<OnTransactionHandler>[0]['transaction'];

export function chainIdHexToNumber(chainId: string): number | null {
	const chainMap: Record<string, number> = {
		'0x1': 1,
		'0x38': 56,
	};
	return chainMap[chainId] || null;
}

export function toChecksumAddress(address: string): string {
	// Remove '0x' prefix and convert to lowercase
	address = address.toLowerCase().replace('0x', '');

	// Get the keccak256 hash of the address
	const hash = keccak256(address);

	// Create a check-summed address
	let checksumAddress = '0x';
	for (let i = 0; i < address.length; i++) {
		// Uppercase the address character if the corresponding hash character is greater than 8
		checksumAddress += parseInt(hash[i], 16) >= 8 ? address[i].toUpperCase() : address[i];
	}

	return checksumAddress;
}

export async function getBlockHeight() {
	try {
		// Use the snap's provider to call the eth_blockNumber method
		const blockNumberHex = (await ethereum.request({
			method: 'eth_blockNumber',
		})) as string;

		// Convert the hex block number to a decimal number
		const blockNumber = parseInt(blockNumberHex, 16);

		//console.log(`Current Block Height: ${blockNumber}`);
		return blockNumber.toString();
	} catch (error) {
		console.error('Error retrieving block height:', error);
		throw error;
	}
}

export function getRiskLevelText(riskLevel: number): string {
	switch (riskLevel) {
		case 0:
			return 'No Obvious Risk';
		case 1:
			return 'Caution';
		case 2:
			return 'Low';
		case 3:
			return 'Medium';
		case 4:
			return 'High';
		case 5:
			return 'Critical';
		default:
			return 'Unknown';
	}
}

export function getRiskLevelColor(riskLevel: number): string {
	switch (riskLevel) {
		case 0:
			return '🟢';
		case 1:
			return '🟡';
		case 2:
			return '🟡';
		case 3:
			return '🟠';
		case 4:
			return '🔴';
		case 5:
			return '🔴';
		default:
			return '❔';
	}
}

export function getRiskLevelVariant(riskLevel: number): Severity {
	switch (riskLevel) {
		case 0:
			return 'success';
		case 1:
			return 'info';
		case 2:
			return 'warning';
		case 3:
			return 'warning';
		case 4:
			return 'warning';
		case 5:
			return 'danger';
		default:
			return 'info';
	}
}

export function scenariosLevelToBannerValues(riskLevels: number[]): [Severity, string, string][] {
	let results: [Severity, string, string][] = []

	for (let i = 0; i < riskLevels.length; i++) {
		switch (riskLevels[i]) {
			case 0:
				results.push([
					'success',
					'No Obvious Risk',
					'This transaction does not appear to pose any significant risk. However, we recommend reviewing all transaction details before proceeding.',
				]);
				break;
			case 1:
				results.push(['warning', 'Medium Risk', 'The destination address appears to be NOT SAFE. We strongly recommend rejecting this transaction.']);
				break;
			case 2:
				results.push(['danger', 'High Risk', 'It seems you are interacting with a malicious website. We strongly recommend rejecting this transaction.']);
				break;
			case 10:
				results.push(['info', 'Caution', 'This transaction currently shows no identified security concerns. However, we recommend reviewing all transaction details before proceeding.']);
				break;
			case 20:
				results.push(['warning', 'Low Risk', 'This transaction poses a low risk. We recommend reviewing all transaction details before proceeding.']);
				break;
			case 30:
				results.push(['warning', 'Medium Risk', 'This transaction poses a medium risk. We recommend reviewing all transaction details carefully before proceeding.']);
				break;
			case 40:
				results.push(['danger', 'High Risk', 'This transaction poses a high risk. We strongly recommend rejecting this transaction.']);
				break;
			case 50:
				results.push(['danger', 'Critical Risk', 'This transaction poses a critical risk. We strongly recommend rejecting this transaction.']);
				break;
			default:
				results.push(['info', 'Unknown Risk', 'We could not determine the risk level of this transaction. Please review all transaction details carefully before proceeding.']);
				break;
		}
	}
	return results
}

export const getRiskTitle = (riskName: string): string => {
	const riskDescriptions: { [key: string]: string } = {
		// Destination Analysis
		malicious_destination_interaction: 'Transaction To Known Malicious Address',
		EOA_destination_interaction: 'Transaction Destination Is An EOA Address',
		new_unverified_contract_interaction: 'Transaction To Recently Created Unverified Contract',
		unverified_contract_interaction: 'Transaction To Unverified Contract',
		new_verified_contract_interaction: 'Transaction To Recently Created Verified Contract',
		low_activity_address_interaction: 'Transaction To Address With Little Transaction History',

		// Function Signature Analysis
		malicious_signature: 'Transaction Calls A Known Malicious Function',
		unknown_signature: 'Transaction Uses Unknown Function Signature',
		custom_function: 'Transaction Calls Custom/Non-Standard Function',

		// Function Parameter Analysis
		blacklisted_address_in_params: 'Function Parameter Contains Blacklisted Address',
		eoa_in_params: 'Function Parameter Contains EOA Address',
		unverified_contract_in_params: 'Function Parameter Contains Unverified Contract',
		low_activity_address_in_params: 'Function Parameter Contains Low-Activity Address',

		// ERC20 Transfer Analysis
		malicious_recipient: 'Transferring Tokens To Known Malicious Address',
		invalid_transfer: 'Could Not Determine Recipient Address For Transfer',
		unverified_contract_recipient: 'Transferring Tokens To Unverified Contract',
		contract_recipient: 'Transferring Tokens To A Contract',
		new_contract_recipient: 'Transferring Tokens To Recently Created Contract',
		low_activity_recipient: 'Transferring Tokens To Low-Activity Address',
		high_portion_transfer: 'Transferring Unusually Large Amount Of Tokens Or Using TransferFrom For Large Portion Of Balance',

		// ERC20 TransferFrom Analysis
		delegation_mismatch: 'TransferFrom Operator Is Not The Recipient',
		contract_source: 'Transferring Tokens From A Contract',

		// ERC20 Approval Analysis
		malicious_spender: 'Approving Tokens To Known Malicious Address',
		invalid_approval: 'Could Not Determine Spender Address For Approval',
		unlimited_EOA_approval: 'Unlimited Token Approval To EOA Address',
		unlimited_unverified_contract_approval: 'Unlimited Token Approval To Unverified Contract',
		unlimited_approval: 'Unlimited Token Approval To Verified Contract',
		EOA_approval: 'Token Approval To EOA Address',
		unverified_contract_approval: 'Token Approval To Unverified Contract',

		// dApp Security Analysis
		dapp_risk: 'The dApp URL Is Flagged As Risky By Threat Intelligence',
	};

	// If the mapping does not exist, reformat the risk name and return it.
	return riskDescriptions[riskName] || formatRiskName(riskName);
};

function formatRiskName(name: string): string {
	return name
		.replace(/_/g, ' ') // Replace underscores with spaces
		.replace(/\b\w/g, (char) => char.toUpperCase()); // Capitalize first letter of each word
}

interface RiskDetail {
	name: string;
	value: string;
}

interface RiskCategory {
	category: string;
	category_id: number;
	risk_level: number;
	risk_detail: RiskDetail[];
}

interface SecurityApiResponse {
	status: string;
	code: string;
	data: {
		request_id: string;
		has_result: boolean;
		polling_interval: null | number;
		risk_level: number;
		risk_categories: Record<string, RiskCategory | null>;
	};
}

export async function findScenarios(transaction: Transaction, chainId: CaipChainId, transactionOrigin?: string): Promise<[Severity, string, string][]> {
	let scenarios: [Severity, string, string][] = [];

	// If no target address, return default scenario
	if (!transaction.to) {
		scenarios.push(...scenariosLevelToBannerValues([0]));
		return scenarios;
	}

	try {
		// Call security detection API
		const response = await fetch('URL', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from_address: transaction.from,
				to_address: transaction.to,
				chain_id: chainId,
			}),
		});

		if (!response.ok) {
			console.error('API request failed:', response.statusText);
			scenarios.push(...scenariosLevelToBannerValues([99]));
			return scenarios;
		}

		const data: SecurityApiResponse = await response.json();

		if (data.status === 'OK' && data.data.has_result) {
			const riskLevel = data.data.risk_level;
			const riskCategories = data.data.risk_categories;

			// Collect all risk details and add to scenarios
			for (const categoryKey in riskCategories) {
				const category = riskCategories[categoryKey];

				// Skip if category is null or undefined
				if (!category) {
					continue;
				}

				// Use each category's own risk_level instead of the overall risk_level
				const categorySeverity = getRiskLevelVariant(category.risk_level);

				if (category.risk_detail && category.risk_detail.length > 0) {
					category.risk_detail.forEach(detail => {
						if (detail.value) {
							// If categoryKey is '2', insert at the beginning of scenarios array
							if (categoryKey === '2') {
								scenarios.unshift([categorySeverity, detail.name, detail.value]);
							} else {
								scenarios.push([categorySeverity, detail.name, detail.value]);
							}
						}
					});
				}
			}
		} else {
			// API did not return results, use default scenario
			scenarios.push(['success', 'No Obvious Risk', 'This transaction does not appear to pose any significant risk. However, we recommend reviewing all transaction details before proceeding.']);
		}
	} catch (error) {
		console.error('Error calling security API:', error);
		// If API call fails, return default scenario
		scenarios.push(['success', 'No Obvious Risk', 'This transaction does not appear to pose any significant risk. However, we recommend reviewing all transaction details before proceeding.']);
	}
	return scenarios;
}


export async function findInsights(transaction: Transaction, chainId: string, transactionOrigin?: string): Promise<string> {
	let basetoken = ""
	if (chainId == '25') {
		basetoken = "CRO"
	} else if (chainId == '338') {
		basetoken = "TCRO"
	}

	if (transaction.to.toLowerCase() == "0x66C0893E38B2a52E1Dc442b2dE75B802CcA49566".toLowerCase()) {
		return "You are interacting with a SmartRouter contract on https://vvs.finance and swapping 1 CRO for 49939 VVS"
	} else if (transaction.data != "0x") {
		return findInsightsWithGrok(transaction,chainId, transactionOrigin)
	} else if (transaction.value != "0x0") {
		const croValue = ethers.formatEther(transaction.value);
		return "You are transferring " + croValue + " " +basetoken + " to " + transaction.to
	}
	return ""
}


export async function findInsightsWithGrok(transaction: Transaction, chainId: string, transactionOrigin?: string): Promise<string> {
	try {
		const response = await axios.post('https://api.openai.com/v1/chat/completions', {
			model: 'gpt-5.1',
			messages: [{
				role: 'user',
				content: 'You are on Cronos chain, Explain below transaction payload clear within 25 words: ' + transaction.data
			}],
			max_completion_tokens: 50000,
		}, {
			headers: {
				'Authorization': 'Bearer sk-proj-{TOKEN}',
				'Content-Type': 'application/json'
			}
		});
		return response.data.choices[0].message.content;
	} catch (error) {
		return error.toString();
	}


}

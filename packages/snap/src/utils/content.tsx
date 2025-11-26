/* eslint-disable */
import {
	heading,
	panel,
	text,
	divider,
	address,
	row,
	UnauthorizedError,
	MethodNotFoundError,
	NotificationType,
} from '@metamask/snaps-sdk';
import {
	Box,
	Heading,
	Text,
	Divider,
	Address,
	Row,
	Link,
	Container,
	Footer,
	Button,
	Section,
	Value,
	Bold,
	Card,
	Tooltip,
} from '@metamask/snaps-sdk/jsx';

export const onHomePageContent = (
	<Box>
		<Heading>Cronos Assistant</Heading>
		<Text>
			Explore the power of Cronos Assistant and fortify your MetaMask
			experience. Navigate the crypto space with confidence.
		</Text>
		<Divider />
		<Section>
			<Heading>🔗 Links</Heading>
			<Text>
				Installation Guide:{' '}
				<Link href="https://hashdit.gitbook.io/hashdit-snap/usage/installing-hashdit-snap">
					Installation
				</Link>
			</Text>
			<Text>
				Documentation:{' '}
				<Link href="https://hashdit.gitbook.io/hashdit-snap">Docs</Link>
			</Text>
			<Text>
				FAQ/Knowledge Base:{' '}
				<Link href="https://hashdit.gitbook.io/hashdit-snap/information/faq-and-knowledge-base">
					FAQ
				</Link>
			</Text>
		</Section>
		<Heading>Thank you for using Cronos Assistant!</Heading>
	</Box>
);

export const onInstallContent = (
	<Box>
		<Heading>🛠️ Next Steps For Your Installation</Heading>
		<Section>
			<Text>
				<Bold>Step 1</Bold>
			</Text>
			<Text>
				To ensure the most secure experience, please connect all your
				MetaMask accounts with the Cronos Assistant.
			</Text>
			<Text>
				<Bold>Step 2</Bold>
			</Text>
			<Text>
				Sign the Cronos Assistant message request. This is required to
				enable the Cronos Assistant to enable a complete experience.
			</Text>
			<Divider />
			<Heading>🔗 Links</Heading>
			<Text>
				Installation Guide:{' '}
				<Link href="https://hashdit.gitbook.io/hashdit-snap/usage/installing-hashdit-snap">
					Installation
				</Link>
			</Text>
			<Text>
				Documentation:{' '}
				<Link href="https://hashdit.gitbook.io/hashdit-snap">Docs</Link>
			</Text>
			<Text>
				FAQ/Knowledge Base:{' '}
				<Link href="https://hashdit.gitbook.io/hashdit-snap/information/faq-and-knowledge-base">
					FAQ
				</Link>
			</Text>
			<Text>
				MetaMask Store Page:{' '}
				<Link href="https://snaps.metamask.io/snap/npm/hashdit-snap-security/">
					Snap Store
				</Link>
			</Text>
		</Section>
		<Heading>Thank you for using Cronos Assistant!</Heading>
	</Box>
);

export const errorContent = (
	<Box>
		<Heading>Cronos Assistant</Heading>
		<Section>
			<Text>
				An error occurred while retrieving the risk details for this
				transaction. If the issue persists, please try reinstalling
				Cronos Assistant Snap and try again.
			</Text>
		</Section>
	</Box>
);

export const notSupportedChainContent = (
	<Box>
		<Heading>Chain Not Supported</Heading>
		<Section>
			<Text>
				Sorry! This blockchain network is not currently supported by
				Cronos Assistant. Full analysis is available
				for <Bold>Cronos Testnet</Bold> and <Bold>Cronos Mainnet</Bold>{' '}
				networks.
			</Text>
		</Section>
	</Box>
);

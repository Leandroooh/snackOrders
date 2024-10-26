import { checkbox, input, select } from '@inquirer/prompts';
import chalk from 'chalk';

import { menuItems } from './menu.js';
let id = 1;
const orders = [];

const regex = /^[A-Za-zÀ-ÖØ-öø-ÿ]+(?: [A-Za-zÀ-ÖØ-öø-ÿ]+)*$/;

// Criar os pedidos dinamicamente
const createOrderItem = async (client, items) => {
	return {
		id: id++,
		client: client,
		data: new Date(),
		status: 'Pendente',
		items: items,
	};
};

const createOrder = async () => {
	// Solicitando o nome do Cliente
	const clientName = await input({ message: 'Qual seu nome?' });

	// Verificando se o valor fornecido atende as necessidades do Regex.
	if (!regex.test(clientName)) {
		sendMessage(
			chalk.redBright(
				'Você precisa informar um nome válido! \n  Ex: "Ana Paula", "Paula"',
			),
		);
		return;
	}

	// Cardápio Disponível p/ seleção
	const selectItems = await checkbox({
		message: 'Selecione o que você deseja!',

		// Cardápio ( menu.js )
		// Mais itens podem ser adicionados caso necessário, seguindo o modelo do Menu.js
		choices: menuItems,
	});

	if (selectItems.length <= 0) {
		sendMessage(
			chalk.redBright(
				'Você precisa selecionar itens para incluir no seu pedido!',
			),
		);
		return;
	}

	const newItem = await createOrderItem(clientName, selectItems);

	orders.push(newItem);

	// Verifica se o pedido foi adicionado corretamente
	sendMessage(chalk.greenBright(`Pedido #${id} criado com sucesso!`));
};

const verifyOrder = async () => {
	// Exibir todos pedidos em tabela, se houver algum
	if (orders.length > 0) {
		console.table(
			orders.map((order) => ({
				ID: order.id,
				Cliente: order.client,
				Data: order.data.toLocaleString(),
				status: order.status,
				Itens: order.items.join(', '),
			})),
		);
	} else {
		console.log('');
		console.log(chalk.redBright('Nenhum pedido foi criado ainda.'));
		console.log('');
	}
};

const changeOrder = async () => {
	// Verificando se existem pedidos
	if (orders.length <= 0) {
		sendMessage(chalk.red('Nenhum pedido foi criado até o momento!'));
		return;
	}

	// Formatando a mensagem para aparecer na Tabela
	const getOrders = orders.map((item) => {
		return { name: `#${item.id} - ${item.client}`, value: item.id };
	});

	// Criando o checkbox para atualizar os pedidos
	const listedItems = await checkbox({
		message:
			'Selecione o pedido para marcar como concluído utilizando o espaço!',

		choices: getOrders,
	});

	// Verificação de que algo foi selecionado
	if (listedItems.length === 0) {
		sendMessage(chalk.red('Nenhum pedido foi selecionado!'));
		return;
	}

	// Iterando sobre o listedItems para retornar o ID
	for (const order of listedItems) {
		const pedido = orders.find((item) => {
			// Comparando o ID do pedido com o id da Orders
			return item.id === order;
		});
		// Alterando o Status
		pedido.status = 'Concluido';
	}
};

const showStatus = async (status) => {
	// Filtrando os pedidos Pendentes
	const orderStatus = orders.filter((item) => item.status === status);

	// Verificando se existem pedidos com o Status passado
	if (orderStatus.length <= 0) {
		sendMessage('Não há nenhum pedido nesta categoria!');
		return;
	}

	// Formatando a mensagem para aparecer na Tabela
	const statusMap = orderStatus.map(
		(item) => `#${item.id} ${item.client} - ${item.status}`,
	);

	// Mostrando o pedido formatado ( #00 Exemplo - Concluido )
	console.table(statusMap);
};

// mensagens personalizadas
const sendMessage = (message) => {
	console.clear();
	// Exibir a mensagem personalizada
	if (message) {
		console.log();
		console.log(message);
		console.log();
	} else {
		// Mensagem padrão caso nada seja passado como argumento
		console.log();
		console.log('Mensagem não definida!');
		console.log();
	}
};

// Iniciando o menu de interações
const start = async () => {
	while (true) {
		const option = await select({
			message: '',
			choices: [
				{
					name: 'Criar Pedido',
					value: 'createOrder',
				},
				{
					name: 'Listar Pedidos',
					value: 'listOrder',
				},
				{
					name: 'Atualizar Pedido',
					value: 'updateOrder',
				},
				{
					name: 'Pedidos Pendentes',
					value: 'pendingOrder',
				},
				{
					name: 'Pedidos Concluidos',
					value: 'completedOrder',
				},
				{
					name: 'Fechar',
					value: 'close',
				},
			],
		});

		// Aplicando as funções aos botões
		switch (option) {
			case 'createOrder':
				await createOrder();
				break;
			case 'listOrder':
				await verifyOrder();
				break;
			case 'updateOrder':
				await changeOrder();
				break;
			case 'pendingOrder':
				await showStatus('Pendente');
				break;
			case 'completedOrder':
				await showStatus('Concluido');
				break;
			case 'close':
				return;
		}
	}
};

start();

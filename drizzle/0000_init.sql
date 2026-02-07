CREATE TABLE `campanhas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`etiquetaId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`mensagem` text NOT NULL,
	`quantidadeEnvios` int NOT NULL DEFAULT 0,
	`criadoPor` int NOT NULL,
	`status` enum('rascunho','enviada','agendada') NOT NULL DEFAULT 'rascunho',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`enviadaEm` timestamp,
	CONSTRAINT `campanhas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contatos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`telefone` varchar(20) NOT NULL,
	`email` varchar(320),
	`avatar` text,
	`observacoes` text,
	`status` enum('novo','em_atendimento','convertido','perdido') NOT NULL DEFAULT 'novo',
	`ticketStatus` enum('aberto','resolvido') NOT NULL DEFAULT 'aberto',
	`vendedorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `contatos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contatos_etiquetas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contatoId` int NOT NULL,
	`etiquetaId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `contatos_etiquetas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `empresas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`nome` varchar(255) NOT NULL,
	`cnpj` varchar(18),
	`telefone` varchar(20),
	`email` varchar(320),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `empresas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `etiquetas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(100) NOT NULL,
	`cor` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `etiquetas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_pedido` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pedidoId` int NOT NULL,
	`produtoId` int NOT NULL,
	`quantidade` int NOT NULL,
	`precoUnitario` decimal(10,2) NOT NULL,
	`subtotal` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `itens_pedido_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mensagens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`contatoId` int NOT NULL,
	`vendedorId` int,
	`remetente` enum('usuario','contato','sistema') NOT NULL,
	`conteudo` text NOT NULL,
	`tipo` enum('texto','imagem','audio','arquivo','sistema') NOT NULL DEFAULT 'texto',
	`arquivoUrl` text,
	`lida` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mensagens_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `numeros_whatsapp` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`numero` varchar(20) NOT NULL,
	`nome` varchar(100) NOT NULL,
	`vendedorId` int,
	`status` enum('conectado','desconectado','aguardando') NOT NULL DEFAULT 'aguardando',
	`qrCode` text,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `numeros_whatsapp_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`contatoId` int NOT NULL,
	`vendedorId` int NOT NULL,
	`valorTotal` decimal(10,2) NOT NULL,
	`status` enum('aberto','confirmado','em_producao','enviado','entregue','cancelado') NOT NULL DEFAULT 'aberto',
	`dataEntrega` timestamp NOT NULL,
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `pedidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `produtos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`modelo` varchar(100),
	`medida` varchar(100),
	`preco` decimal(10,2) NOT NULL,
	`estoque` int NOT NULL DEFAULT 0,
	`sku` varchar(50),
	`descricao` text,
	`categoria` varchar(100),
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `produtos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `respostas_rapidas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tenantId` int NOT NULL,
	`titulo` varchar(100) NOT NULL,
	`mensagem` text NOT NULL,
	`atalho` varchar(50),
	`criadoPor` int NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `respostas_rapidas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`tenantId` int NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`setor` enum('vendas','logistica','financeiro','admin') NOT NULL DEFAULT 'vendas',
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`)
);

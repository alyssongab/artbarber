import prismaClient from "../src/server/shared/config/prisma";
import bcrypt from "bcrypt";

/**
 * Seed do banco de dados - dados iniciais para desenvolvimento/teste
 * 
 * Execute com: npx tsx src/seed.ts
 */
async function seed() {
    console.log("🌱 Iniciando seed do banco de dados...\n");

    try {
        // Limpar dados existentes (opcional - comente se não quiser limpar)
        console.log("🗑️  Limpando dados existentes...");
        await prismaClient.appointment.deleteMany();
        await prismaClient.service.deleteMany();
        await prismaClient.user.deleteMany();
        console.log("✅ Dados limpos com sucesso!\n");

        // Hash padrão para todas as senhas (senha: "123456")
        const salt = 10;
        const defaultPasswordHash = await bcrypt.hash("123456", salt);

        // ==================== CRIAR USUÁRIOS ====================
        console.log("👥 Criando usuários...");

        // Admin
        const admin = await prismaClient.user.create({
            data: {
                full_name: "Admin Sistema",
                email: "admin@barbearia.com",
                password: defaultPasswordHash,
                phone_number: "92999999999",
                role: "ADMIN",
                birthday: null,
            }
        });
        console.log(`   ✓ Admin criado: ${admin.full_name} (${admin.email})`);

        // Barbeiro
        const barber = await prismaClient.user.create({
            data: {
                full_name: "Carlos Barbeiro",
                email: "carlos@barbearia.com",
                password: defaultPasswordHash,
                phone_number: "92988888888",
                role: "BARBER",
                birthday: new Date("1985-05-15"),
            }
        });
        console.log(`   ✓ Barbeiro criado: ${barber.full_name} (${barber.email})`);

        // Cliente 1
        const client1 = await prismaClient.user.create({
            data: {
                full_name: "João Silva",
                email: "joao@cliente.com",
                password: defaultPasswordHash,
                phone_number: "92977777777",
                role: "CLIENT",
                birthday: new Date("1990-03-20"),
            }
        });
        console.log(`   ✓ Cliente criado: ${client1.full_name} (${client1.email})`);

        // Cliente 2
        const client2 = await prismaClient.user.create({
            data: {
                full_name: "Maria Santos",
                email: "maria@cliente.com",
                password: defaultPasswordHash,
                phone_number: "92966666666",
                role: "CLIENT",
                birthday: new Date("1995-08-10"),
            }
        });
        console.log(`   ✓ Cliente criado: ${client2.full_name} (${client2.email})\n`);

        // ==================== CRIAR SERVIÇOS ====================
        console.log("🛠️  Criando serviços...");

        const serviceCabelo = await prismaClient.service.create({
            data: {
                name: "Corte de cabelo",
                price: 50,
                duration: 45,
            }
        });
        console.log(`   ✓ Serviço criado: ${serviceCabelo.name} - R$ ${serviceCabelo.price}`);

        const serviceSobrancelha = await prismaClient.service.create({
            data: {
                name: "Sobrancelha",
                price: 20,
                duration: 15,
            }
        });
        console.log(`   ✓ Serviço criado: ${serviceSobrancelha.name} - R$ ${serviceSobrancelha.price}`);

        const serviceBarba = await prismaClient.service.create({
            data: {
                name: "Barba completa",
                price: 35,
                duration: 30,
            }
        });
        console.log(`   ✓ Serviço criado: ${serviceBarba.name} - R$ ${serviceBarba.price}`);

        const serviceCombo = await prismaClient.service.create({
            data: {
                name: "Combo cabelo + barba",
                price: 75,
                duration: 75,
            }
        });
        console.log(`   ✓ Serviço criado: ${serviceCombo.name} - R$ ${serviceCombo.price}\n`);

        // ==================== CRIAR AGENDAMENTOS ====================
        console.log("📅 Criando agendamentos...");

        // Agendamento 1 - Cliente 1 com barbeiro (Pendente)
        const appointment1 = await prismaClient.appointment.create({
            data: {
                appointment_date: new Date("2026-01-15"),
                appointment_time: new Date("1970-01-01T14:30:00Z"),
                appointment_status: "PENDENTE",
                id_barber: barber.user_id,
                id_client: client1.user_id,
                id_service: serviceCabelo.service_id,
                notification_sent: false,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client1.full_name} - ${serviceCabelo.name} (${appointment1.appointment_status})`);

        // Agendamento 2 - Cliente 2 com barbeiro (Pendente)
        const appointment2 = await prismaClient.appointment.create({
            data: {
                appointment_date: new Date("2026-01-15"),
                appointment_time: new Date("1970-01-01T15:30:00Z"),
                appointment_status: "PENDENTE",
                id_barber: barber.user_id,
                id_client: client2.user_id,
                id_service: serviceCombo.service_id,
                notification_sent: false,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client2.full_name} - ${serviceCombo.name} (${appointment2.appointment_status})`);

        // Agendamento 3 - Cliente 1 com barbeiro (Concluído)
        const appointment3 = await prismaClient.appointment.create({
            data: {
                appointment_date: new Date("2026-01-10"),
                appointment_time: new Date("1970-01-01T10:00:00Z"),
                appointment_status: "CONCLUIDO",
                id_barber: barber.user_id,
                id_client: client1.user_id,
                id_service: serviceBarba.service_id,
                notification_sent: true,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client1.full_name} - ${serviceBarba.name} (${appointment3.appointment_status})`);

        // Agendamento 4 - Cliente 2 com barbeiro (Concluído)
        const appointment4 = await prismaClient.appointment.create({
            data: {
                appointment_date: new Date("2025-12-12"),
                appointment_time: new Date("1970-01-01T16:00:00Z"),
                appointment_status: "CONCLUIDO",
                id_barber: barber.user_id,
                id_client: client2.user_id,
                id_service: serviceSobrancelha.service_id,
                notification_sent: true,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client2.full_name} - ${serviceSobrancelha.name} (${appointment4.appointment_status})`);

        // Agendamento 5 - Agendamento presencial (sem cliente cadastrado)
        const appointment5 = await prismaClient.appointment.create({
            data: {
                appointment_date: new Date("2025-12-16"),
                appointment_time: new Date("1970-01-01T09:00:00Z"),
                appointment_status: "PENDENTE",
                id_barber: barber.user_id,
                id_client: null, // Agendamento presencial
                id_service: serviceCabelo.service_id,
                notification_sent: false,
            }
        });
        console.log(`   ✓ Agendamento criado: Cliente presencial - ${serviceCabelo.name} (${appointment5.appointment_status})\n`);

        // ==================== RESUMO ====================
        console.log("✅ Seed concluído com sucesso!\n");
        console.log("📊 Resumo:");
        console.log(`   • 4 usuários criados (1 admin, 1 barbeiro, 2 clientes)`);
        console.log(`   • 4 serviços criados`);
        console.log(`   • 5 agendamentos criados\n`);
        console.log("🔑 Credenciais de acesso (senha para todos: 123456):");
        console.log(`   • Admin: admin@barbearia.com`);
        console.log(`   • Barbeiro: carlos@barbearia.com`);
        console.log(`   • Cliente 1: joao@cliente.com`);
        console.log(`   • Cliente 2: maria@cliente.com\n`);

    } catch (error) {
        console.error("❌ Erro ao executar seed:", error);
        throw error;
    } finally {
        await prismaClient.$disconnect();
    }
}

// Executar seed
seed()
    .catch((error) => {
        console.error("❌ Erro fatal:", error);
        process.exit(1);
    });
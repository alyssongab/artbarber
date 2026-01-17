import prismaClient from "../src/server/shared/config/prisma";
import bcrypt from "bcrypt";

/**
 * Database seeding for development
 * 
 */
async function seed() {
    console.log("🌱 Iniciando seed do banco de dados...\n");

    try {

        console.log("🗑️  Limpando dados existentes...");
        await prismaClient.appointment.deleteMany();
        await prismaClient.service.deleteMany();
        await prismaClient.user.deleteMany();
        console.log("✅ Dados limpos com sucesso!\n");

        const salt = 10;
        const defaultPasswordHash = await bcrypt.hash("123456", salt);

        const barber1_photo = "https://res.cloudinary.com/dblzx2zri/image/upload/v1768626603/linus-torvalds_joay7v.jpg";
        const barber1_thumb = "https://res.cloudinary.com/dblzx2zri/image/upload/c_auto,g_auto,w_150,h_150,f_auto,q_auto/v1768626603/linus-torvalds_joay7v.jpg";

        const barber2_photo = "https://res.cloudinary.com/dblzx2zri/image/upload/v1768620913/barbers/barber_1768620912478.jpg";
        const barber2_thumb = "https://res.cloudinary.com/dblzx2zri/image/upload/c_auto,g_auto,w_150,h_150,f_auto,q_auto/v1768620913/barbers/barber_1768620912478.jpg";

        // ==================== CREATE USERS ====================
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

        // Barber1
        const barber1 = await prismaClient.user.create({
            data: {
                full_name: "Carlos Barbeiro",
                email: "carlos@barbearia.com",
                password: defaultPasswordHash,
                phone_number: "92988888888",
                role: "BARBER",
                birthday: new Date("1985-05-15"),
                photo_url: barber1_photo,
                thumbnail_url: barber1_thumb
            }
        });
        console.log(`   ✓ Barbeiro criado: ${barber1.full_name} (${barber1.email})`);

        // Barber2
        const barber2 = await prismaClient.user.create({
            data: {
                full_name: "Lucas Barbeiro",
                email: "lucas@barbearia.com",
                password: defaultPasswordHash,
                phone_number: "92955555555",
                role: "BARBER",
                birthday: new Date("1995-05-30"),
                photo_url: barber2_photo,
                thumbnail_url: barber2_thumb
            }
        });
        console.log(`   ✓ Barbeiro criado: ${barber2.full_name} (${barber2.email})`);

        // Client 1
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

        // Client 2
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

        // ==================== CREATE SERVICES ====================
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

        // ==================== CREATE APPOINTMENTS ====================
        console.log("📅 Criando agendamentos...");

        const appointment1 = await prismaClient.appointment.create({
            data: {
                appointment_datetime: new Date("2026-01-19T14:30:00Z"),
                appointment_status: "PENDENTE",
                id_barber: barber1.user_id,
                id_client: client1.user_id,
                id_service: serviceCabelo.service_id,
                notification_sent: false,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client1.full_name} - ${serviceCabelo.name} (${appointment1.appointment_status})`);

        const appointment2 = await prismaClient.appointment.create({
            data: {
                appointment_datetime: new Date("2026-01-20T15:30:00Z"),
                appointment_status: "PENDENTE",
                id_barber: barber1.user_id,
                id_client: client2.user_id,
                id_service: serviceCombo.service_id,
                notification_sent: false,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client2.full_name} - ${serviceCombo.name} (${appointment2.appointment_status})`);

        const appointment3 = await prismaClient.appointment.create({
            data: {
                appointment_datetime: new Date("2026-01-10T14:00:00Z"),
                appointment_status: "CONCLUIDO",
                id_barber: barber2.user_id,
                id_client: client1.user_id,
                id_service: serviceBarba.service_id,
                notification_sent: true,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client1.full_name} - ${serviceBarba.name} (${appointment3.appointment_status})`);

        const appointment4 = await prismaClient.appointment.create({
            data: {
                appointment_datetime: new Date("2025-12-30T18:00:00Z"),
                appointment_status: "CONCLUIDO",
                id_barber: barber2.user_id,
                id_client: client2.user_id,
                id_service: serviceSobrancelha.service_id,
                notification_sent: true,
            }
        });
        console.log(`   ✓ Agendamento criado: ${client2.full_name} - ${serviceSobrancelha.name} (${appointment4.appointment_status})`);

        const appointment5 = await prismaClient.appointment.create({
            data: {
                appointment_datetime: new Date("2025-01-05T22:00:00Z"),
                appointment_status: "CANCELADO",
                id_barber: barber1.user_id,
                id_client: null, 
                id_service: serviceCabelo.service_id,
                notification_sent: false,
            }
        });
        console.log(`   ✓ Agendamento criado: Cliente presencial - ${serviceCabelo.name} (${appointment5.appointment_status})\n`);

        console.log("✅ Seed concluído com sucesso!\n");
        console.log("📊 Resumo:");
        console.log(`   • 5 usuários criados (1 admin, 2 barbeiros, 2 clientes)`);
        console.log(`   • 4 serviços criados`);
        console.log(`   • 5 agendamentos criados\n`);
        console.log("🔑 Credenciais de acesso (senha para todos: 123456):");
        console.log(`   • Admin: admin@barbearia.com`);
        console.log(`   • Barbeiro 1: carlos@barbearia.com`);
        console.log(`   • Barbeiro 2: lucass@barbearia.com`);
        console.log(`   • Cliente 1: joao@cliente.com`);
        console.log(`   • Cliente 2: maria@cliente.com\n`);

    } catch (error) {
        console.error("❌ Erro ao executar seed:", error);
        throw error;
    } finally {
        await prismaClient.$disconnect();
    }
}


seed()
    .catch((error) => {
        console.error("❌ Erro fatal:", error);
        process.exit(1);
    });
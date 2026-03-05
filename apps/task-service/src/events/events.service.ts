import { Injectable, OnModuleInit } from '@nestjs/common';
import * as amqplib from 'amqplib';

@Injectable()
export class EventsService implements OnModuleInit {
    private channel: amqplib.Channel;

    async onModuleInit() {
        const connection = await amqplib.connect(process.env.RABBITMQ_URL!);
        this.channel = await connection.createChannel();
        await this.channel.assertExchange('task_events', 'fanout', { durable: true });
    }

    async publish(event: string, data: any) {
        const message = JSON.stringify({ event, data, timestamp: new Date() });
        this.channel.publish('task_events', '', Buffer.from(message));
    }
}
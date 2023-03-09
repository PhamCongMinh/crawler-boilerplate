module.exports = {
    port: 3001,
    redis: {
        port: 6379,
        host: 'localhost',
        password: '',
        tls: false,
    },
    username: 'nft',
    password: 'example',
    queues: ['crawler'],
};

import mongoose from 'mongoose';

export default async () => {
    try {
        // .env içindeki MONGO_URI'yi kullanır
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB: Veritabanına Mersin usulü bağlandık!');
    } catch (err) {
        console.error('❌ MongoDB: Bağlantı hatası!', err.message);
    }
};
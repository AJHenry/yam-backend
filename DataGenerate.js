import { createPost } from './database-actions';
export const generateData = async () => {
  for (var i = 0; i < 15; i++) {
    console.log(`Generated #${i}`);
    createPost(
      {
        contentBody: `This is test post in Pittsburgh #${i}`,
        location: {
          latitude: 40.44767,
          longitude: -79.9606,
        },
      },
      { accountId: 1 }
    );
  }
};

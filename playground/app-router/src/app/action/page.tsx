import { auth, currentUser } from '@clerk/nextjs';

export default function AddToCart() {
  async function addItem(data: any) {
    'use server';
    console.log(auth().userId);
    console.log((await currentUser())?.firstName);
    console.log('add item server action', data);
  }

  return (
    // @ts-ignore
    <form action={addItem}>
      <input
        value={'test'}
        type='text'
        name='name'
      />
      <button type='submit'>Add to Cart</button>
    </form>
  );
}

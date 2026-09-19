import saltImage from '../assets/salt.png'
import cokeZeroImage from '../assets/cokezero.png'
import ketchupImage from '../assets/ketchup.png'
import spoonImage from '../assets/spoon.png'

export const addOns = [
  {
    id: 'salt',
    name: 'Salt',
    price: 1,
    unit: 'per sachet',
    image: saltImage,
    maxQuantity: 5
  },
  {
    id: 'cokeZero',
    name: 'Coke Zero',
    price: 20,
    unit: 'per 250ml',
    image: cokeZeroImage,
    maxQuantity: 5
  },
  {
    id: 'ketchup',
    name: 'Ketchup',
    price: 2,
    unit: 'per sachet',
    image: ketchupImage,
    maxQuantity: 5
  },
  {
    id: 'spoon',
    name: 'Spoon',
    price: 2,
    unit: 'per pc',
    image: spoonImage,
    maxQuantity: 5
  }

  
]
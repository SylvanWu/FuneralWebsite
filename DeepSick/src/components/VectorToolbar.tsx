import React, { useState, useEffect } from 'react';
import './VectorToolbar.css';

// Import decoration images
import chocolateImage from '../assets/smallPicture/chocolate.png';
import milkImage from '../assets/smallPicture/milk.png';
import strawberryMilkImage from '../assets/smallPicture/streberry milk.png';
import blueFlowerImage from '../assets/smallPicture/blue flower.png';
import redTreeImage from '../assets/smallPicture/red tree.png';
import bianfuImage from '../assets/smallPicture/bianfu.png';
import man1Image from '../assets/smallPicture/man1.png';
import man2Image from '../assets/smallPicture/man2.png';
import man3Image from '../assets/smallPicture/man3.png';
import man4Image from '../assets/smallPicture/man4.png';
import man5Image from '../assets/smallPicture/man5.png';
import man6Image from '../assets/smallPicture/man6.png';
import woman1Image from '../assets/smallPicture/woman1.png';
import woman2Image from '../assets/smallPicture/woman2.png';
import woman3Image from '../assets/smallPicture/woman3.png';
import woman4Image from '../assets/smallPicture/woman4.png';
import woman5Image from '../assets/smallPicture/woman5.png';
import woman6Image from '../assets/smallPicture/woman6.png';
import man8Image from '../assets/smallPicture/man8.png';
import girl1Image from '../assets/smallPicture/girl1.png';
import girl2Image from '../assets/smallPicture/girl2.png';
import grandpa1Image from '../assets/smallPicture/grandpa1.png';
import grandma1Image from '../assets/smallPicture/grandma1.png';
import boy1Image from '../assets/smallPicture/boy1.png';
import boy2Image from '../assets/smallPicture/boy2.png';
import man9Image from '../assets/smallPicture/man9.png';
import woman7Image from '../assets/smallPicture/woman7.png';
import woman8Image from '../assets/smallPicture/woman8.png';
import boy3Image from '../assets/smallPicture/boy3.png';
import criedboyImage from '../assets/smallPicture/cried boy.png';
import girl3Image from '../assets/smallPicture/girl3.png';
import man10Image from '../assets/smallPicture/man10.png';
import girl4Image from '../assets/smallPicture/girl4.png';
import woman9Image from '../assets/smallPicture/woman9.png';
import boyImage from '../assets/smallPicture/boy.png';
import girlImage from '../assets/smallPicture/girl.png';
import SantaClausImage from '../assets/smallPicture/Santa Claus.png';
import snowmanImage from '../assets/smallPicture/snowman.png';
import ChristmastreeImage from '../assets/smallPicture/Christmastree.png';
import elkImage from '../assets/smallPicture/elk.png';
import redtelevisionImage from '../assets/smallPicture/redtelevision.png';
import pinktelevisionImage from '../assets/smallPicture/pinktelevision.png';
import greentelevisionImage from '../assets/smallPicture/greentelevision.png';
import woman10Image from '../assets/smallPicture/woman10.png';
import girl5Image from '../assets/smallPicture/girl5.png';
import girl6Image from '../assets/smallPicture/girl6.png';
import girl7Image from '../assets/smallPicture/girl7.png';
import bagImage from '../assets/smallPicture/bag.png';
import dogImage from '../assets/smallPicture/dog.png';
import heartImage from '../assets/smallPicture/heart.png';
import bombImage from '../assets/smallPicture/Bomb.png';
import womanImage from '../assets/smallPicture/woman.png';
import woman11Image from '../assets/smallPicture/woman11.png';
import man0Image from '../assets/smallPicture/man.png';
import man11Image from '../assets/smallPicture/man11.png';
import woman12Image from '../assets/smallPicture/woman12.png';
import man12Image from '../assets/smallPicture/man12.png';
import man13Image from '../assets/smallPicture/man13.png';
import man14Image from '../assets/smallPicture/man14.png';
import man15Image from '../assets/smallPicture/man15.png';
import man16Image from '../assets/smallPicture/man16.png';
import man17Image from '../assets/smallPicture/man17.png';
import cowImage from '../assets/smallPicture/cow.png';
import cow1Image from '../assets/smallPicture/cow1.png';
import cattleImage from '../assets/smallPicture/cattle.png';
import yellowpigImage from '../assets/smallPicture/yellowpig.png';
import pinkpigImage from '../assets/smallPicture/pinkpig.png';
import greypigImage from '../assets/smallPicture/greypig.png';
import chickenImage from '../assets/smallPicture/chicken.png';
import chicken1Image from '../assets/smallPicture/chicken1.png';
import chicken2Image from '../assets/smallPicture/chicken3.png';
import treeImage from '../assets/smallPicture/tree.png';
import grassImage from '../assets/smallPicture/grass.png';
import man18Image from '../assets/smallPicture/man18.png';
import man19Image from '../assets/smallPicture/man19.png';
import man20Image from '../assets/smallPicture/man20.png';
import man21Image from '../assets/smallPicture/man21.png';
import man22Image from '../assets/smallPicture/man22.png';
import man23Image from '../assets/smallPicture/man23.png';
import man24Image from '../assets/smallPicture/man24.png';
import man25Image from '../assets/smallPicture/man25.png';
import man26Image from '../assets/smallPicture/man26.png';
import man27Image from '../assets/smallPicture/man27.png';
import woman13Image from '../assets/smallPicture/woman13.png';
import woman14Image from '../assets/smallPicture/woman14.png';
import woman15Image from '../assets/smallPicture/woman15.png';
import man28Image from '../assets/smallPicture/man28.png';
import brotherImage from '../assets/smallPicture/brothers.png';
import driverImage from '../assets/smallPicture/driver.png';
import driver1Image from '../assets/smallPicture/driver1.png';
import driver2Image from '../assets/smallPicture/driver2.png';
import driver3Image from '../assets/smallPicture/driver3.png';
import grapesImage from '../assets/smallPicture/grapes.png';
import kiwifruitImage from '../assets/smallPicture/kiwifruit.png';
import pineappleImage from '../assets/smallPicture/pineapple.png';
import cherryImage from '../assets/smallPicture/cherry.png';
import hamimelonImage from '../assets/smallPicture/hamimelon.png';
import orangeImage from '../assets/smallPicture/orange.png';
import appleImage from '../assets/smallPicture/apple.png';
import lemonImage from '../assets/smallPicture/lemon.png';
import forkliftImage from '../assets/smallPicture/forklift.png';
import forklift1Image from '../assets/smallPicture/forklift1.png';
import loaderImage from '../assets/smallPicture/loader.png';
import loader1Image from '../assets/smallPicture/loader1.png';
import man29Image from '../assets/smallPicture/man29.png';
import man30Image from '../assets/smallPicture/man30.png';
import fireImage from '../assets/smallPicture/fire.png';
import bonfireImage from '../assets/smallPicture/bonfire.png';
import fenceImage from '../assets/smallPicture/fence.png';
import cactusImage from '../assets/smallPicture/cactus.png';
import blackcatImage from '../assets/smallPicture/blackcat.png';
import catImage from '../assets/smallPicture/cat.png';
import treasurechestImage from '../assets/smallPicture/treasurechest.png';
import treasurechest1Image from '../assets/smallPicture/treasurechest1.png';
import appletreeImage from '../assets/smallPicture/appletree.png';
import tree1Image from '../assets/smallPicture/tree1.png';
import whitedogImage from '../assets/smallPicture/whitedog.png';
import monkeyImage from '../assets/smallPicture/monkey.png';
import birdImage from '../assets/smallPicture/bird.png';
import devilImage from '../assets/smallPicture/devil.png';
import devil1Image from '../assets/smallPicture/devil1.png';
import peachImage from '../assets/smallPicture/peach.png';
import bearImage from '../assets/smallPicture/bear.png';
import axeImage from '../assets/smallPicture/axe.png';
import turtleImage from '../assets/smallPicture/turtle.png';
import fairyImage from '../assets/smallPicture/fairy.png';
import redfishImage from '../assets/smallPicture/redfish.png';
import yellowfishImage from '../assets/smallPicture/yellowfish.png';
import blueseahorseImage from '../assets/smallPicture/blueseahorse.png';
import giftImage from '../assets/smallPicture/gift.png';
import buildingImage from '../assets/smallPicture/building.png';
import bonsaiImage from '../assets/smallPicture/bonsai.png';
import submarineImage from '../assets/smallPicture/submarine.png';
import icecreamImage from '../assets/smallPicture/icecream.png';
import wreathImage from '../assets/smallPicture/wreath.png';
import cakeImage from '../assets/smallPicture/cake.png';
import cake1Image from '../assets/smallPicture/cake1.png';
import cattle1Image from '../assets/smallPicture/cattle1.png';
import sushiImage from '../assets/smallPicture/sushi.png';
import sushi1Image from '../assets/smallPicture/sushi1.png';
import sushi2Image from '../assets/smallPicture/sushi2.png';
import sushi3Image from '../assets/smallPicture/sushi3.png';
import sushi4Image from '../assets/smallPicture/sushi4.png';
import sushi5Image from '../assets/smallPicture/sushi5.png';
import sushi6Image from '../assets/smallPicture/sushi6.png';
import ghostImage from '../assets/smallPicture/ghost.png';
import dragonImage from '../assets/smallPicture/dragon.png';
import snakeImage from '../assets/smallPicture/snake.png';
import yellowsheepImage from '../assets/smallPicture/yellowsheep.png';
import sheepImage from '../assets/smallPicture/sheep.png';
import chicken3Image from '../assets/smallPicture/chicken2.png';
import pumpkinmanImage from '../assets/smallPicture/pumpkinman.png';
import horseImage from '../assets/smallPicture/horse.png';
import santaclausImage from '../assets/smallPicture/santaclaus.png';
import dog1Image from '../assets/smallPicture/dog1.png';
import santaclaus1Image from '../assets/smallPicture/santaclaus1.png';
import santaclaus2Image from '../assets/smallPicture/santaclaus2.png';
import santaclaus3Image from '../assets/smallPicture/santaclaus3.png';
import gift1Image from '../assets/smallPicture/gift1.png';
import gift2Image from '../assets/smallPicture/gift2.png';
import gift3Image from '../assets/smallPicture/gift3.png';
import elk1Image from '../assets/smallPicture/elk1.png';
import snowman1Image from '../assets/smallPicture/snowman1.png';
import chrismastreeImage from '../assets/smallPicture/chrismastree.png';
import bellImage from '../assets/smallPicture/bell.png';
import carImage from '../assets/smallPicture/car.png';
import taxiImage from '../assets/smallPicture/taxi.png';
import tigerImage from '../assets/smallPicture/tiger.png';
import rabbitImage from '../assets/smallPicture/rabbit.png'; 
import charizardImage from '../assets/smallPicture/charizard.png'; 
import sunImage from '../assets/smallPicture/sun.png'; 
import earthImage from '../assets/smallPicture/earth.png'; 


interface VectorItem {
  id: string;
  category: string;
  name: string;
  description?: string;
  src: string;
}

interface VectorToolbarProps {
  onItemDragStart: (e: React.DragEvent<HTMLDivElement>, item: VectorItem) => void;
  onCollapseChange?: (isCollapsed: boolean) => void;
  onItemClick?: (item: VectorItem) => void;
  loadingItems?: Set<string>; // Set of item IDs that are currently loading
}

// Define categories
const CATEGORIES = [
  { key: 'plants', label: 'Plants' },
  { key: 'food', label: 'Food' },
  { key: 'fruits', label: 'Fruits' },
  { key: 'symbols', label: 'Symbols' },
  { key: 'character', label: 'Character' },
  { key: 'animals', label: 'Animals' },
  { key: 'objects', label: 'Objects' },
  { key: 'buildings', label: 'Buildings' },
];

// Vector items with actual images
const VECTOR_ITEMS: VectorItem[] = [
  // Plants category
  { 
    id: 'blue-flower',
    category: 'plants',
    name: 'Blue Flower',
    src: blueFlowerImage,
  },
    
  { 
    id: 'red-tree',
    category: 'plants',
    name: 'Memorial Tree',
    src: redTreeImage
  },
  { 
    id: 'tree',
    category: 'plants',
    name: 'Tree',
    src: treeImage
  }, 
  { 
    id: 'Christmastree',
    category: 'plants',
    name: 'Christmas Tree',
    src: ChristmastreeImage
  }, 
  { 
    id: 'grass',
    category: 'plants',
    name: 'Grass',
    src: grassImage
  },
  { 
    id: 'cactus',
    category: 'plants',
    name: 'Cactus',
    src: cactusImage
  },
  { 
    id: 'appletree',
    category: 'plants',
    name: 'Apple Tree',
    src: appletreeImage
  },
  { 
    id: 'tree1',
    category: 'plants',
    name: 'Tree',
    src: tree1Image
  },
  { 
    id: 'chrismastree',
    category: 'plants',
    name: 'Christmas Tree',
    src: chrismastreeImage
  },
  // Buildings category
  { 
    id: 'building',
    category: 'buildings',
    name: 'Building',
    src: buildingImage
  },
  // Food category
  { 
    id: 'chocolate',
    category: 'food',
    name: 'Memorial Chocolate',
    src: chocolateImage
  },
  { 
    id: 'milk',
    category: 'food',
    name: 'Milk Offering',
    src: milkImage
  },
  { 
    id: 'strawberry-milk',
    category: 'food',
    name: 'Strawberry Milk',
    src: strawberryMilkImage
  },
  { 
    id: 'icecream',
    category: 'food',
    name: 'Ice Cream',
    src: icecreamImage
  },
  { 
    id: 'cake',
    category: 'food',
    name: 'Cake',
    src: cakeImage
  },
  { 
    id: 'cake1',
    category: 'food',
    name: 'Cake',
    src: cake1Image
  },
  { 
    id: 'sushi',
    category: 'food',
    name: 'Sushi',
    src: sushiImage
  },
  { 
    id: 'sushi1',
    category: 'food',
    name: 'Sushi',
    src: sushi1Image
  },
  { 
    id: 'sushi2',
    category: 'food',
    name: 'Sushi',
    src: sushi2Image
  },
  { 
    id: 'sushi3',
    category: 'food',
    name: 'Sushi',
    src: sushi3Image
  },
  { 
    id: 'sushi4',
    category: 'food',
    name: 'Sushi',
    src: sushi4Image
  },
  { 
    id: 'sushi5',
    category: 'food',
    name: 'Sushi',
    src: sushi5Image
  },
  { 
    id: 'sushi6',
    category: 'food',
    name: 'Sushi',
    src: sushi6Image
  },

  // Fruits category
  { 
    id: 'grapes',
    category: 'fruits',
    name: 'Grapes',
    src: grapesImage
  },
  { 
    id: 'kiwifruit',
    category: 'fruits',
    name: 'Kiwi Fruit',
    src: kiwifruitImage
  },
  { 
    id: 'pineapple',
    category: 'fruits',
    name: 'Pineapple',
    src: pineappleImage
  },
  { 
    id: 'cherry',
    category: 'fruits',
    name: 'Cherry',
    src: cherryImage
  },
  { 
    id: 'hamimelon',
    category: 'fruits',
    name: 'Hamimelon',
    src: hamimelonImage
  },
  { 
    id: 'orange',
    category: 'fruits',
    name: 'Orange',
    src: orangeImage
  },
  { 
    id: 'apple',
    category: 'fruits',
    name: 'Apple',
    src: appleImage
  },
  { 
    id: 'lemon',
    category: 'fruits',
    name: 'Lemon',
    src: lemonImage
  },
  { 
    id: 'peach',
    category: 'fruits',
    name: 'Peach',
    src: peachImage
  },
  // Symbols category
  { 
    id: 'heart',
    category: 'symbols',
    name: 'Heart',
    src: heartImage
  },
  { 
    id: 'fire',
    category: 'symbols',
    name: 'Fire',
    src: fireImage
  },
  { 
    id: 'bonfire',
    category: 'symbols',
    name: 'Bonfire',
    src: bonfireImage
  },
  { 
    id: 'devil',
    category: 'symbols',
    name: 'Devil',
    src: devilImage
  },
  { 
    id: 'devil1',
    category: 'symbols',
    name: 'Devil',
    src: devil1Image
  },
  { 
    id: 'ghost',
    category: 'symbols',
    name: 'Ghost',
    src: ghostImage
  },
  { 
    id: 'earth',
    category: 'symbols',
    name: 'Earth',
    src: earthImage
  },
  { 
    id: 'sun',
    category: 'symbols',
    name: 'Sun',
    src: sunImage
  },
  { 
    id: 'gift',
    category: 'symbols',
    name: 'Gift',
    src: giftImage
  },
  { 
    id: 'gift1',
    category: 'symbols',
    name: 'Gift',
    src: gift1Image
  },
  { 
    id: 'gift2',
    category: 'symbols',
    name: 'Gift',
    src: gift2Image
  },
  { 
    id: 'gift3',
    category: 'symbols',
    name: 'Gift',
    src: gift3Image
  },
  { 
    id: 'bell',
    category: 'symbols',
    name: 'Bell',
    src: bellImage
  },
  
  // Animals category
  { 
    id: 'bianfu',
    category: 'animals',
    name: 'Bat',
    src: bianfuImage
  },
  { 
    id: 'elk',
    category: 'animals',
    name: 'Elk',
    src: elkImage
  },
  { 
    id: 'dog',
    category: 'animals',
    name: 'Dog',
    src: dogImage
  },
  { 
    id: 'cow',
    category: 'animals',
    name: 'Cow',
    src: cowImage
  },
  { 
    id: 'cow1',
    category: 'animals',
    name: 'Cow',
    src: cow1Image
  },
  { 
    id: 'cattle',
    category: 'animals',
    name: 'Cattle',
    src: cattleImage
  },
  { 
    id: 'yellowpig',
    category: 'animals',
    name: 'Yellow Pig',
    src: yellowpigImage
  },
  { 
    id: 'pinkpig',
    category: 'animals',
    name: 'Pink Pig',
    src: pinkpigImage
  },
  { 
    id: 'rabbit',
    category: 'animals',
    name: 'Rabbit',
    src: rabbitImage
  },
  { 
    id: 'greypig',
    category: 'animals',
    name: 'Grey Pig',
    src: greypigImage
  },
  { 
    id: 'chicken',
    category: 'animals',
    name: 'Chicken',
    src: chickenImage
  },
  { 
    id: 'chicken1',
    category: 'animals',
    name: 'Chicken',
    src: chicken1Image
  },
  { 
    id: 'tiger',
    category: 'animals',
    name: 'Tiger',
    src: tigerImage
  },
  { 
    id: 'chicken2',
    category: 'animals',
    name: 'Chicken',
    src: chicken2Image
  },
  { 
    id: 'blackcat',
    category: 'animals',
    name: 'Black Cat',
    src: blackcatImage
  },
  { 
    id: 'charizard',
    category: 'animals',
    name: 'Charizard',
    src: charizardImage
  },
  { 
    id: 'cat',
    category: 'animals',
    name: 'Cat',
    src: catImage
  },
  { 
    id: 'whitedog',
    category: 'animals',
    name: 'White Dog',
    src: whitedogImage
  },
  { 
    id: 'monkey',
    category: 'animals',
    name: 'Monkey',
    src: monkeyImage
  },
  { 
    id: 'bird',
    category: 'animals',
    name: 'Bird',
    src: birdImage
  },
  { 
    id: 'bear',
    category: 'animals',
    name: 'Bear',
    src: bearImage
  },
  { 
    id: 'elk1',
    category: 'animals',
    name: 'Elk',
    src: elk1Image
  },
  { 
    id: 'turtle',
    category: 'animals',
    name: 'Turtle',
    src: turtleImage
  },
  { 
    id: 'redfish',
    category: 'animals',
    name: 'Red Fish',
    src: redfishImage
  },
  { 
    id: 'yellowfish',
    category: 'animals',
    name: 'Yellow Fish',
    src: yellowfishImage
  },
  { 
    id: 'blueseahorse',
    category: 'animals',
    name: 'Blue Sea Horse',
    src: blueseahorseImage
  },
  { 
    id: 'cattle1',
    category: 'animals',
    name: 'Cattle',
    src: cattle1Image
  },
  { 
    id: 'dragon',
    category: 'animals',
    name: 'Dragon',
    src: dragonImage
  },
  { 
    id: 'snake',
    category: 'animals',
    name: 'Snake',
    src: snakeImage
  },
  { 
    id: 'yellowsheep',
    category: 'animals',
    name: 'Yellow Sheep',
    src: yellowsheepImage
  },
  { 
    id: 'sheep',
    category: 'animals',
    name: 'Sheep',
    src: sheepImage
  },
  { 
    id: 'chicken3',
    category: 'animals',
    name: 'Chicken',
    src: chicken3Image
  },
  { 
    id: 'horse',
    category: 'animals',
    name: 'Horse',
    src: horseImage
  },
  { 
    id: 'dog1',
    category: 'animals',
    name: 'Dog',
    src: dog1Image
  },
  // Objects category
  { 
    id: 'redtelevision',
    category: 'objects',
    name: 'Red Television',
    src: redtelevisionImage
  },
  { 
    id: 'bonsai',
    category: 'objects',
    name: 'Bonsai',
    src: bonsaiImage
  },
  { 
    id: 'pinktelevision',
    category: 'objects',
    name: 'Pink Television',
    src: pinktelevisionImage
  },
  { 
    id: 'greentelevision',
    category: 'objects',
    name: 'Green Television',
    src: greentelevisionImage
  },
  { 
    id: 'snowman',
    category: 'objects',
    name: 'Snowman',
    src: snowmanImage
  },
  { 
    id: 'bag',
    category: 'objects',
    name: 'Bag',
    src: bagImage
  },
  { 
    id: 'bomb',
    category: 'objects',
    name: 'Bomb',
    src: bombImage
  },
  { 
    id: 'taxi',
    category: 'objects',
    name: 'Taxi',
    src: taxiImage
  },
  { 
    id: 'wreath',
    category: 'objects',
    name: 'Wreath',
    src: wreathImage
  },
  { 
    id: 'forklift',
    category: 'objects',
    name: 'Forklift',
    src: forkliftImage
  },
  { 
    id: 'forklift1',
    category: 'objects',
    name: 'Forklift',
    src: forklift1Image
  },
  { 
    id: 'loader',
    category: 'objects',
    name: 'Loader',
    src: loaderImage
  },
  { 
    id: 'loader1',
    category: 'objects',
    name: 'Loader',
    src: loader1Image
  },
  { 
    id: 'submarine',
    category: 'objects',
    name: 'Submarine',
    src: submarineImage
  },
  { 
    id: 'fence',
    category: 'objects',
    name: 'Fence',
    src: fenceImage
  },
  { 
    id: 'treasurechest',
    category: 'objects',
    name: 'Treasure Chest',
    src: treasurechestImage
  },
  { 
    id: 'treasurechest1',
    category: 'objects',
    name: 'Treasure Chest',
    src: treasurechest1Image
  },
  { 
    id: 'axe',
    category: 'objects',
    name: 'Axe',
    src: axeImage
  },
  { 
    id: 'car',
    category: 'objects',
    name: 'Car',
    src: carImage
  },
  { 
    id: 'snowman1',
    category: 'objects',
    name: 'Snowman',
    src: snowman1Image
  },
  // Character category
  { 
    id: 'man1',
    category: 'character',
    name: 'Man',
    src: man1Image
  },
  { 
    id: 'man2',
    category: 'character',
    name: 'Man',
    src: man2Image
  },
  { 
    id: 'man3',
    category: 'character',
    name: 'Man',
    src: man3Image
  },
  { 
    id: 'woman1',
    category: 'character',
    name: 'Woman',
    src: woman1Image
  },
  { 
    id: 'woman2',
    category: 'character',
    name: 'Woman',
    src: woman2Image
  },
  { 
    id: 'woman3',
    category: 'character',
    name: 'Woman',
    src: woman3Image
  },
  { 
    id: 'man4',
    category: 'character',
    name: 'Man',
    src: man4Image
  },
  { 
    id: 'man5',
    category: 'character',
    name: 'Man',
    src: man5Image
  },
  { 
    id: 'man6',
    category: 'character',
    name: 'Man',
    src: man6Image
  },
  { 
    id: 'woman4',
    category: 'character',
    name: 'Woman',
    src: woman4Image
  },
  { 
    id: 'woman5',
    category: 'character',
    name: 'Woman',
    src: woman5Image
  },
  { 
    id: 'woman6',
    category: 'character',
    name: 'Woman',
    src: woman6Image
  },
  { 
    id: 'man8',
    category: 'character',
    name: 'Man',
    src: man8Image
  },
  { 
    id: 'girl1',
    category: 'character',
    name: 'Girl',
    src: girl1Image
  },
  { 
    id: 'girl2',
    category: 'character',
    name: 'Girl',
    src: girl2Image
  },
  { 
    id: 'grandpa1',
    category: 'character',
    name: 'Grandpa',
    src: grandpa1Image
  },
  { 
    id: 'grandma1',
    category: 'character',
    name: 'Grandma',
    src: grandma1Image
  },
  { 
    id: 'boy1',
    category: 'character',
    name: 'Boy',
    src: boy1Image
  },
  { 
    id: 'boy2',
    category: 'character',
    name: 'Boy',
    src: boy2Image
  },
  { 
    id: 'man9',
    category: 'character',
    name: 'Man',
    src: man9Image
  },
  { 
    id: 'woman7',
    category: 'character',
    name: 'Woman',
    src: woman7Image
  },
  { 
    id: 'woman8',
    category: 'character',
    name: 'Woman',
    src: woman8Image
  },
  { 
    id: 'boy3',
    category: 'character',
    name: 'Boy',
    src: boy3Image
  },
  { 
    id: 'criedboy',
    category: 'character',
    name: 'CriedBoy',
    src: criedboyImage
  },
  { 
    id: 'girl3',
    category: 'character',
    name: 'Girl',
    src: girl3Image
  },
  { 
    id: 'man10',
    category: 'character',
    name: 'Man',
    src: man10Image
  },
  { 
    id: 'girl4',
    category: 'character',
    name: 'Girl',
    src: girl4Image
  },
  { 
    id: 'woman9',
    category: 'character',
    name: 'Woman',
    src: woman9Image
  },
  { 
    id: 'boy',
    category: 'character',
    name: 'Boy',
    src: boyImage
  },
  { 
    id: 'girl',
    category: 'character',
    name: 'Girl',
    src: girlImage
  },
  { 
    id: 'SantaClaus',
    category: 'character',
    name: 'Santa Claus',
    src: SantaClausImage
  },
  { 
    id: 'woman10',
    category: 'character',
    name: 'Woman',
    src: woman10Image
  },
  { 
    id: 'girl5',
    category: 'character',
    name: 'Girl',
    src: girl5Image
  },
  { 
    id: 'girl6',
    category: 'character',
    name: 'Girl',
    src: girl6Image
  },
  { 
    id: 'girl7',
    category: 'character',
    name: 'Girl',
    src: girl7Image
  },
  { 
    id: 'woman',
    category: 'character',
    name: 'Woman',
    src: womanImage
  },
  { 
    id: 'woman11',
    category: 'character',
    name: 'Woman',
    src: woman11Image
  },
  { 
    id: 'man0',
    category: 'character',
    name: 'Man',
    src: man0Image
  },
  { 
    id: 'man11',
    category: 'character',
    name: 'Man',
    src: man11Image
  },
  { 
    id: 'woman12',
    category: 'character',
    name: 'Woman',
    src: woman12Image
  },
  { 
    id: 'man12',
    category: 'character',
    name: 'Man',
    src: man12Image
  },
  { 
    id: 'man13',
    category: 'character',
    name: 'Man',
    src: man13Image
  },
  { 
    id: 'man14',
    category: 'character',
    name: 'Man',
    src: man14Image
  },
  { 
    id: 'man15',
    category: 'character',
    name: 'Man',
    src: man15Image
  },
  { 
    id: 'man16',
    category: 'character',
    name: 'Man',
    src: man16Image
  },
  { 
    id: 'man17',
    category: 'character',
    name: 'Man',
    src: man17Image
  },
  { 
    id: 'man18',
    category: 'character',
    name: 'Man',
    src: man18Image
  },
  { 
    id: 'man19',
    category: 'character',
    name: 'Man',
    src: man19Image
  },
  { 
    id: 'man20',
    category: 'character',
    name: 'Man',
    src: man20Image
  },
  { 
    id: 'man21',
    category: 'character',
    name: 'Man',
    src: man21Image
  },
  { 
    id: 'man22',
    category: 'character',
    name: 'Man',
    src: man22Image
  },
  { 
    id: 'man23',
    category: 'character',
    name: 'Man',
    src: man23Image
  },
  { 
    id: 'man24',
    category: 'character',
    name: 'Man',
    src: man24Image
  },
  { 
    id: 'man25',
    category: 'character',
    name: 'Man',
    src: man25Image
  },
  { 
    id: 'man26',
    category: 'character',
    name: 'Man',
    src: man26Image
  },
  { 
    id: 'man27',
    category: 'character',
    name: 'Man',
    src: man27Image
  },
  { 
    id: 'woman13',
    category: 'character',
    name: 'Woman',
    src: woman13Image
  },
  { 
    id: 'woman14',
    category: 'character',
    name: 'Woman',
    src: woman14Image
  },
  { 
    id: 'woman15',
    category: 'character',
    name: 'Woman',
    src: woman15Image
  },
  { 
    id: 'man28',
    category: 'character',
    name: 'Man',
    src: man28Image
  },
  { 
    id: 'brothers',
    category: 'character',
    name: 'Brothers',
    src: brotherImage
  },
  { 
    id: 'driver',
    category: 'character',
    name: 'Driver',
    src: driverImage
  },
  { 
    id: 'driver1',
    category: 'character',
    name: 'Driver',
    src: driver1Image
  },
  { 
    id: 'driver2',
    category: 'character',
    name: 'Driver',
    src: driver2Image
  },
  { 
    id: 'driver3',
    category: 'character',
    name: 'Driver',
    src: driver3Image
  },
  { 
    id: 'man29',
    category: 'character',
    name: 'Man',
    src: man29Image
  },
  { 
    id: 'man30',
    category: 'character',
    name: 'Man',
    src: man30Image
  },
  { 
    id: 'fairy',
    category: 'character',
    name: 'Fairy',
    src: fairyImage
  },
  { 
    id: 'pumpkinman',
    category: 'character',
    name: 'Pumpkin Man',
    src: pumpkinmanImage
  },
  { 
    id: 'santaclaus',
    category: 'character',
    name: 'Santa Claus',
    src: santaclausImage
  },
  { 
    id: 'santaclaus1',
    category: 'character',
    name: 'Santa Claus',
    src: santaclaus1Image
  },
  { 
    id: 'santaclaus2',
    category: 'character',
    name: 'Santa Claus',
    src: santaclaus2Image
  },
  { 
    id: 'santaclaus3',
    category: 'character',
    name: 'Santa Claus',
    src: santaclaus3Image
  },

  
  
  
  
];

export const VectorToolbar: React.FC<VectorToolbarProps> = ({ onItemDragStart, onCollapseChange, onItemClick, loadingItems }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0].key);
  const [draggedItem, setDraggedItem] = useState<VectorItem | null>(null);

  // Filter items based on search and category
  const filteredItems = VECTOR_ITEMS.filter(item => 
    item.category === activeCategory &&
    (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  // Handle drag start
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, item: VectorItem) => {
    setDraggedItem(item);
    
    // Create a drag image
    const dragImage = new Image();
    dragImage.src = item.src;
    dragImage.style.width = '32px';
    dragImage.style.height = '32px';
    e.dataTransfer.setDragImage(dragImage, 16, 16);
    
    // Call parent handler
    onItemDragStart(e, item);
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // Toggle collapse
  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    onCollapseChange?.(newCollapsedState);
  };

  return (
    <div className={`vector-toolbar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div className="toolbar-header">
        {!isCollapsed && (
          <input
            type="text"
            className="search-input"
            placeholder="Search items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        )}
        <button 
          className="collapse-button"
          onClick={toggleCollapse}
          title={isCollapsed ? 'Expand' : 'Collapse'}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>

      {/* Categories */}
      <div className="toolbar-categories">
        {CATEGORIES.map(category => (
          <button
            key={category.key}
            className={`category-button ${activeCategory === category.key ? 'active' : ''} ${isCollapsed ? 'collapsed' : ''}`}
            onClick={() => setActiveCategory(category.key)}
            title={isCollapsed ? category.label : undefined}
          >
            {!isCollapsed && category.label}
            {isCollapsed && category.label[0]} {/* Show only first letter when collapsed */}
          </button>
        ))}
      </div>

      {/* Vector Items Grid */}
      <div className="toolbar-items">
        {filteredItems.length > 0 ? (
          // Group items by pairs (2 columns)
          Array.from(
            { length: Math.ceil(filteredItems.length / 2) },
            (_, rowIndex) => {
              const rowItems = filteredItems.slice(rowIndex * 2, rowIndex * 2 + 2);
              return (
                <div className="vector-row" key={`row-${rowIndex}`}>
                  {rowItems.map(item => (
                    <div
                      key={item.id}
                      className={`vector-item ${draggedItem?.id === item.id ? 'dragging' : ''} ${loadingItems?.has(item.id) ? 'loading' : ''}`}
                      draggable={!loadingItems?.has(item.id)}  // Only draggable if not loading
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      onClick={() => !loadingItems?.has(item.id) && onItemClick?.(item)}
                      title={loadingItems?.has(item.id) ? 'Loading...' : (item.description || item.name)}
                    >
                      <img src={item.src} alt={item.name} className="vector-icon" />
                      {loadingItems?.has(item.id) && (
                        <div className="loading-indicator">
                          <div className="spinner"></div>
                        </div>
                      )}
                      {!isCollapsed && <span className="vector-label">{item.name}</span>}
                    </div>
                  ))}
                </div>
              );
            }
          )
        ) : (
          <div className="empty-message">
            {searchTerm ? 'No matching items found' : 'No items in this category'}
          </div>
        )}
      </div>
    </div>
  );
};

export type { VectorItem, VectorToolbarProps }; 
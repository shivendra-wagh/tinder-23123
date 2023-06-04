import React, { useLayoutEffect, useRef, useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/core';
import useAuth from '../hooks/useAuth';
import tw from'tailwind-rn';
import { AntDesign, Entypo, Ionicons } from "@expo/vector-icons"
import Swiper from "react-native-deck-swiper";
import { SafeAreaView } from 'react-native-safe-area-context';
import { onSnapshot, doc, collection, setDoc, query, where, getDocs, getDoc, serverTimestamp } from '@firebase/firestore';
import { db } from "../firebase";
import generateId from '../lib/generateId';

const DUMMY_DATA = [
    {
        firstName:'Elon',
        lastName:'Musk',
        job:'Software Developer',
        photoURL:'https://upload.wikimedia.org/wikipedia/commons/3/34/Elon_Musk_Royal_Society_%28crop2%29.jpg',
        age:40,
        id: 456
    },
    {
        firstName:'Elizabeth',
        lastName:'Olsen',
        job:'Actress',
        photoURL:'https://hips.hearstapps.com/hmg-prod.s3.amazonaws.com/images/elizabeth-holmes-where-is-the-former-theranos-ceo-now-post-trial-1641923071.jpg',
        age:32,
        id: 123
    },
    {
        firstName:'Rafael',
        lastName:'Nadal',
        job:'Tennis player',
        photoURL:'https://www1.pictures.gi.zimbio.com/Australian+Open+2008+Day+1+pTDgav40G-Ux.jpg',
        age:35,
        id:789
    },
];

const HomeScreen = () => {
    const navigation = useNavigation(); 
    const { user, logout } = useAuth();
    const [profiles, setProfiles] = useState([]);
    const swipeRef = useRef(null);

    useLayoutEffect(
        () => 
          onSnapshot(doc(db, 'users', user.uid), snapshot => {
            if (!snapshot.exists()) {
                navigation.navigate("Modal");
            }
        }),
     []
     );

     useEffect(() => {
         let unsub;

         const fetchCards = async () => {
                const passes = await getDocs(collection(db, 'users', user.uid, 'passes')).then(
                    (snapshot) => snapshot.docs.map((doc) => doc.id)
                );

                const swipes = await getDocs(collection(db, 'users', user.uid, 'swipes')).then(
                    (snapshot) => snapshot.docs.map((doc) => doc.id)
                );

                const passedUserIds = passes.lenght > 0 ? passes : ["test"];
                const swipedUserIds = swipes.lenght > 0 ? swipes : ["test"];

             unsub = onSnapshot(
                 query(
                     collection(db, 'users'),
                     where("id", "not-in", [...passedUserIds, ...swipedUserIds])
                     ),
             (snapshot) => {
                 setProfiles(
                     snapshot.docs
                     .filter((doc) => doc.id !== user.uid)
                     .map((doc) => ({
                         id: doc.id,
                         ...doc.data(),
                     }))
                 );
             }
            );
         };
         
         fetchCards();
         return unsub;
     }, [db]);

     const swipeLeft = (cardIndex) => {
        if (!profiles[cardIndex]) return;

        const userSwiped = profiles[cardIndex];
        console.log(`You swiped PASS on ${userSwiped.displayName}`);

        setDoc(doc(db, 'users', user.uid, 'passes', userSwiped.id),
        userSwiped);
     };

     const swipeRight = async(cardIndex) => {
         if (!profiles[cardIndex]) return;

         const userSwiped = profiles[cardIndex];
         const loggedInProfile = await (
             await getDoc(doc(db, 'users', user.uid))
             ).data();

         // Check If the user swiped on you
         getDoc(doc(db, 'users', userSwiped.id, 'swipes', user.uid)).then(
             (documentSnapshot) => {
                if (documentSnapshot.exists()){
                    // user has matched with you before you matched with them...
                    //Create a Match!
                    console.log(`Hooray, You MATCHED with ${userSwiped.displayName}`)
                    setDoc(
                        doc(db, "users", user.uid, "swipes", userSwiped.id),
                        userSwiped
                    );

                    // Create a match
                    setDoc(doc(db, 'matches', generateId(user.uid, userSwiped.id)), {
                        users: {
                            [user.uid]: loggedInProfile,
                            [userSwiped.id]: userSwiped,
                        },
                        usersMatched: [user.uid, userSwiped.id],
                        timestamp: serverTimestamp(),
                    });

                    navigation.navigate('Match', {
                        loggedInProfile, 
                        userSwiped,
                    });
                } else {
                    // User has swiped as first interaction between the two or didnt get swiped on,,
                    console.log(
                        `You swiped on ${userSwiped.displayName} (${userSwiped.job})`
                    );
                    setDoc(
                        doc(db, "users", user.uid, "swipes", userSwiped.id),
                        userSwiped
                    );
                }
             }
         );
     }; 

    return (
        <SafeAreaView style={tw('flex-1')}>
            {/* Header  */}
                <View style={tw("flex-row items-center justify-between px-5 ")}>
                    <TouchableOpacity onPress={logout}>
                        <Image 
                            style={tw("h-10 w-10 rounded-full")}
                            source={{ uri: user.photoURL }} />
                    </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.navigate('Modal')}>
                    <Image style={tw("h-14 w-14")} source={require("../logo.png")} />
                </TouchableOpacity>

                <TouchableOpacity  onPress={()=>navigation.navigate('Chat')}>
                    <Ionicons name='chatbubbles-sharp' size={30} color='#FF5864'/>
                </TouchableOpacity>
                </View>
                {/* End of header  */}

                {/* Cards */}
                <View style={tw('flex-1')}>
                    <Swiper
                    ref={swipeRef}
                    containerStyle={{ backgroundColor: "transparent" }}
                    cards={profiles}
                    stackSize={5}
                    cardIndex={0}
                    animateCardOpacity
                    verticalSwipe={false}
                    onSwipedLeft={(cardIndex)=>{
                        console.log('Swipe Pass')
                        swipeLeft(cardIndex);
                    }}
                    onSwipedRight={(cardIndex)=>{
                        console.log('Swipe Match')
                        swipeRight(cardIndex);
                    }}
                    backgroundColor={"#4fd0e9"}
                    overlayLabels={{
                        left:{
                            title:"NOPE",
                            style:{
                                label:{
                                    textAlign:'right',
                                    color:'red'
                                },
                            },
                        },
                        right:{
                            title:"MATCH",
                            style:{
                                label:{
                                    textAlign:'left',
                                    color:'green'
                                },
                            },
                        },
                    }}
                    renderCard={(card) => card ? (
                        <View 
                            key={card.id} 
                            style={tw("relative bg-white h-3/4 rounded-xl")}>
                          <Image 
                            style={tw("absolute top-0 h-full w-full rounded-xl")}
                            source={{uri: card.photoURL}}
                            />

                            <View style={[tw("absolute bottom-0 bg-white w-full flex-row justify-between items-center h-20 px-6 py-2 rounded-b-xl"
                            ), 
                            styles.cardShadow,
                            ]}
                            >
                                <View>
                                    <Text style={tw("text-xl font-bold")}>
                                        {card.displayName}
                                    </Text>
                                    <Text> {card.job} </Text>                 
                                </View>
                                <Text style={tw("text-2xl font-bold")}>{card.age}</Text>
                            </View>
                        </View>
                    ) : (
                        <View 
                        style={[
                            tw(
                                "relative bg-white h-3/4 rounded-xl justify-center items-center"
                            ),
                            styles.cardShadow,
                          ]}
                        > 
                            <Text style={tw("font-bold pb-5")}>No more profiles</Text>

                            <Image
                                style={tw("h-80 w-full")}
                                height={100}
                                width={100}
                                source={{ uri: "https://links.papareact.com/6gb"  }}
                                />
                            </View>
                    )
                }
            />
           </View>

           <View style={tw('flex flex-row justify-evenly pb-4')}>
                <TouchableOpacity
                style={tw('bg-red-200 rounded-full w-16 h-16 items-center justify-center')}
                onPress={()=>swipeRef.current.swipeLeft()}>
                    <Entypo name= "cross" size={24} color='red'/>
                </TouchableOpacity>
                <TouchableOpacity
                style={tw('bg-green-200 rounded-full w-16 h-16 items-center justify-center')}
                onPress={()=>swipeRef.current.swipeRight()}>
                    <Entypo name= "heart" size={24} color= 'green'/>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

export default HomeScreen

const styles = StyleSheet.create({
    cardShadow: {
        shadowColor:'#000',
        shadowOffset:{
            width:0,
            height:1
        },
        shadowOpacity:0.2,
        shadowRadius:1.41,
        elevation:2
    }
})

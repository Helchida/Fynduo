import React, { useEffect, useState } from "react";
import {
    ScrollView,
    TouchableOpacity,
    Text,
} from "react-native";
import { styles } from "./HouseholdsScreen.style";
import { useAuth } from "hooks/useAuth";
import NoAuthenticatedUser from "components/fynduo/NoAuthenticatedUser/NoAuthenticatedUser";
import { getHouseholdName } from "services/firebase/db";
import { ChevronRightCircle } from "lucide-react-native";


const HouseholdsScreen: React.FC = () => {
    const { user } = useAuth()

    if (!user) return <NoAuthenticatedUser />

    const [householdNames, setHouseholdNames] = useState<Record<string, string>>(
        {}
    );

    useEffect(() => {
        const fetchNames = async () => {
            if (user.households) {
                const namesMap: Record<string, string> = {};
                for (const hId of user.households) {
                    if (hId === user.id) {
                        namesMap[hId] = "Mon Foyer Solo";
                    } else {
                        const name = await getHouseholdName(hId);
                        namesMap[hId] = name || `Foyer (${hId.substring(0, 4)})`;
                    }
                }
                setHouseholdNames(namesMap);
            }
        };
        fetchNames();
    }, [user.households]);

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
        >
            {user.households?.map((hId) => {
                const isSolo = hId === user.id;
                const isActive = hId === user.activeHouseholdId;

                return (
                    !isSolo && <TouchableOpacity
                        key={hId}
                        style={[styles.householdItem, isActive && styles.activeHouseholdItem]}
                        onPress={() => { }}
                    >
                        <Text style={[styles.householdItemText, isActive && styles.activeHouseholdText]}>
                            {householdNames[hId]}
                        </Text>
                        <ChevronRightCircle color={isActive ? "#3498db" : "#2c3e50"} />
                    </TouchableOpacity>
                );
            })}

        </ScrollView>
    );
};

export default HouseholdsScreen;

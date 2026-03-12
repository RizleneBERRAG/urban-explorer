// /screens/DiscoveryScreen.tsx
import React, { useEffect, useState, useRef, useContext } from "react";
import { View, FlatList, ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity } from "react-native";
import LieuCard from "../components/LieuCard";
import { Lieu, APIRecord, ApiResponse, CoordonneesGeo } from "../types/lieu";
import { ThemeContext } from "../contexts/ThemeContext";

const DiscoveryScreen: React.FC = () => {
  const [lieux, setLieux] = useState<Lieu[]>([]);
  const [filteredLieux, setFilteredLieux] = useState<Lieu[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [page, setPage] = useState<number>(0);
  const [hasMoreData, setHasMoreData] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [allLieuxLoaded, setAllLieuxLoaded] = useState<Lieu[]>([]);
  const LIMIT = 50;
  const [totalAvailable, setTotalAvailable] = useState<number>(0);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);

  const fetchLieux = async (pageNum: number) => {
    try {
      console.log(`Fetching page ${pageNum} with limit ${LIMIT}...`);
      
      // Simple pagination - just limit and start
      const url = `https://opendata.paris.fr/api/records/1.0/search/?dataset=que-faire-a-paris-&rows=${LIMIT}&start=${pageNum * LIMIT}`;
      console.log("API URL:", url);
      
      const response = await fetch(url);
      
      console.log("Response status:", response.status);
      const data = await response.json();
      console.log("=== API RESPONSE DEBUG ===");
      console.log("Total hits (nhits):", data.nhits);
      console.log("Records count:", data.records?.length);
      console.log("Current page:", pageNum);
      console.log("Expected start:", pageNum * LIMIT);
      
      // Store total available records
      if (data.nhits) {
        setTotalAvailable(data.nhits);
        console.log("Total available from API:", data.nhits);
      }
      
      // Debug: log the actual URL being called
      console.log("API URL:", url);
      
      if (data.records && Array.isArray(data.records)) {
        // Transform API response to simplified Lieu format
        const lieuxTransformes: Lieu[] = data.records.map((record: APIRecord) => {
          let coords: CoordonneesGeo | null = null;
          
          // Try to get coordinates from multiple sources
          if (record.fields.coordonnees_geo) {
            coords = record.fields.coordonnees_geo;
          } else if (record.geometry?.coordinates) {
            coords = {
              lat: record.geometry.coordinates[1],
              lon: record.geometry.coordinates[0]
            };
          }
          
          // Get image URL - try multiple fields with cover_url as priority
          let imageUrl: string = "https://picsum.photos/200/200"; // default fallback
          if (record.fields.cover_url) {
            imageUrl = record.fields.cover_url;
          } else if (record.fields.main_image) {
            imageUrl = record.fields.main_image;
          } else if (record.fields.image) {
            imageUrl = record.fields.image;
          } else if (record.fields.images && record.fields.images.length > 0) {
            imageUrl = record.fields.images[0];
          }
          
          return {
            id: record.recordid,
            nom_usuel: record.fields.title || record.fields.nom_usuel || 'Sans titre',
            adresse: record.fields.address_name || record.fields.adresse || '',
            coordonnees_geo: coords,
            image: imageUrl,
          };
        });
        console.log("Transformed lieux count:", lieuxTransformes.length);
        if (lieuxTransformes.length > 0) {
          console.log("First lieu:", lieuxTransformes[0]);
        }
        
        // Append new data or set initial data
        if (pageNum === 0) {
          setLieux(lieuxTransformes);
          setFilteredLieux(lieuxTransformes);
          setAllLieuxLoaded(lieuxTransformes);
        } else {
          setLieux(prev => [...prev, ...lieuxTransformes]);
          setFilteredLieux(prev => [...prev, ...lieuxTransformes]);
          setAllLieuxLoaded(prev => [...prev, ...lieuxTransformes]);
        }
        
        // Check if there's more data - compare loaded count with total
        const totalLoaded = pageNum === 0 ? lieuxTransformes.length : allLieuxLoaded.length + lieuxTransformes.length;
        const hasMore = totalLoaded < totalAvailable && lieuxTransformes.length === LIMIT;
        setHasMoreData(hasMore);
        console.log(`Page ${pageNum}: Loaded ${lieuxTransformes.length}, Total loaded: ${totalLoaded}, Total available: ${totalAvailable}, Has more: ${hasMore}`);
      } else {
        console.error("No records found in API response");
        setHasMoreData(false);
      }
      console.log("=========================");
    } catch (error) {
      console.error("Erreur API:", error);
      setHasMoreData(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLieux(0);
    
    // Cleanup timeout on unmount
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // If empty, show all lieux
    if (!text.trim()) {
      setFilteredLieux(allLieuxLoaded);
      return;
    }
    
    // Debounce: wait 500ms after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      const filtered = allLieuxLoaded.filter(lieu => 
        lieu.nom_usuel.toLowerCase().includes(text.toLowerCase()) ||
        (lieu.adresse && lieu.adresse.toLowerCase().includes(text.toLowerCase()))
      );
      setFilteredLieux(filtered);
    }, 500);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredLieux(allLieuxLoaded);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const loadMoreData = () => {
    if (!loading && hasMoreData) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchLieux(nextPage);
    }
  };

  // Debug: log current state
  console.log("Current lieux count:", lieux.length);
  console.log("Loading state:", loading);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  // Show message if no data
  if (lieux.length === 0) {
    return (
      <View style={styles.empty}>
        <Text>Aucun lieu trouvé</Text>
        <Text style={styles.subtext}>Vérifiez la console pour les erreurs</Text>
      </View>
    );
  }

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }
    ]}>
      {/* Theme Toggle Button */}
      <View style={styles.header}>
        <Text style={[
          styles.headerTitle,
          { color: isDarkMode ? '#fff' : '#1a1a1a' }
        ]}>Découvrir Paris</Text>
        <TouchableOpacity 
          style={[styles.themeButton, { backgroundColor: isDarkMode ? '#333' : '#e0e0e0' }]}
          onPress={toggleTheme}
        >
          <Text style={styles.themeButtonText}>
            {isDarkMode ? '☀️' : '🌙'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={[
        styles.searchContainer,
        { backgroundColor: isDarkMode ? '#2a2a2a' : '#fff' }
      ]}>
        <TextInput
          style={[
            styles.searchInput,
            { color: isDarkMode ? '#fff' : '#1a1a1a' }
          ]}
          placeholder="Rechercher un lieu..."
          placeholderTextColor={isDarkMode ? '#888' : '#999'}
          value={searchQuery}
          onChangeText={handleSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <FlatList
        data={filteredLieux}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <LieuCard
            nom={item.nom_usuel}
            adresse={item.adresse}
            lat={item.coordonnees_geo?.lat}
            lon={item.coordonnees_geo?.lon}
            image={item.image}
          />
        )}
        ListHeaderComponent={
          <View style={{ padding: 20, marginBottom: 8 }}>
            <Text style={{ fontSize: 14, color: isDarkMode ? '#aaa' : '#666', marginTop: 4 }}>
              {filteredLieux.length} / {totalAvailable} lieux à explorer
            </Text>
          </View>
        }
        ListFooterComponent={
          loading || !hasMoreData ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              {loading && <ActivityIndicator size="small" color="#007AFF" />}
              {!hasMoreData && filteredLieux.length > 0 && (
                <Text style={{ color: isDarkMode ? '#aaa' : '#666', marginTop: 10 }}>Aucun autre lieu disponible</Text>
              )}
            </View>
          ) : null
        }
        onEndReached={loadMoreData}
        onEndReachedThreshold={0.5}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex:1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  themeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
  },
  loading: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  subtext: {
    color: "#666",
    marginTop: 10,
    fontSize: 14,
  },
});

export default DiscoveryScreen;
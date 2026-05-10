import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import os
import json

# Setup
input_file = 'music.csv'
artifact_dir = r'C:\Users\pduch\.gemini\antigravity\brain\081b4b2c-ed79-4eeb-bca5-2459ce9127ee\artifacts'
os.makedirs(artifact_dir, exist_ok=True)

df = pd.read_csv(input_file)

# 1. Data Cleaning
df['Genres'] = df['Genres'].fillna('Unknown')
df['Current_Playlists'] = df['Current_Playlists'].fillna('None')
df['Release Date'] = pd.to_datetime(df['Release Date'], errors='coerce')
df['Release Year'] = df['Release Date'].dt.year
df['In_Liked_Bool'] = df['In_Liked'].apply(lambda x: True if x == 'oui' else False)

audio_features = ['Danceability', 'Energy', 'Valence', 'Acousticness', 'Instrumentalness', 'Speechiness', 'Tempo', 'Loudness']

# 2. EDA
top_artists = df['Artist Name(s)'].value_counts().head(10).to_dict()
top_genres = df['Genres'].value_counts()
top_genres = top_genres[top_genres.index != 'Unknown'].head(10).to_dict()

most_popular = df.sort_values('Popularity', ascending=False)[['Track Name', 'Artist Name(s)', 'Popularity']].head(5).to_dict('records')

plt.figure(figsize=(10,6))
sns.histplot(df['Release Year'].dropna(), bins=30, kde=True)
plt.title('Distribution des Années de Sortie')
plt.xlabel('Année')
plt.ylabel('Nombre de morceaux')
plt.savefig(os.path.join(artifact_dir, 'release_year_dist.png'))
plt.close()

# 3. Advanced Analysis - Correlation Heatmap
plt.figure(figsize=(10,8))
corr = df[audio_features + ['Popularity']].corr()
sns.heatmap(corr, annot=True, cmap='coolwarm', fmt=".2f")
plt.title('Corrélation entre Audio Features')
plt.tight_layout()
plt.savefig(os.path.join(artifact_dir, 'correlation_heatmap.png'))
plt.close()

# Extremes
def get_extreme(col, maximize=True):
    if maximize:
        row = df.loc[df[col].idxmax()]
    else:
        row = df.loc[df[col].idxmin()]
    return f"{row['Track Name']} par {row['Artist Name(s)']} ({col}: {row[col]})"

extremes = {
    'Most Energetic': get_extreme('Energy', True),
    'Least Energetic': get_extreme('Energy', False),
    'Most Danceable': get_extreme('Danceability', True),
    'Most Acoustic': get_extreme('Acousticness', True),
    'Saddest (Min Valence)': get_extreme('Valence', False),
    'Happiest (Max Valence)': get_extreme('Valence', True),
    'Loudest': get_extreme('Loudness', True)
}

# 4. Clustering (Mood Detection)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(df[audio_features])

# Let's use K=4 for moods (e.g. Chill, Energetic, Sad, Dance)
kmeans = KMeans(n_clusters=4, random_state=42, n_init=10)
df['Mood_Cluster'] = kmeans.fit_predict(X_scaled)

# Cluster centers
cluster_centers = scaler.inverse_transform(kmeans.cluster_centers_)
cluster_df = pd.DataFrame(cluster_centers, columns=audio_features)
cluster_df['Cluster'] = [f"Cluster {i}" for i in range(4)]

# PCA for visualization
pca = PCA(n_components=2)
X_pca = pca.fit_transform(X_scaled)
df['PCA1'] = X_pca[:, 0]
df['PCA2'] = X_pca[:, 1]

plt.figure(figsize=(10,8))
sns.scatterplot(x='PCA1', y='PCA2', hue='Mood_Cluster', palette='Set1', data=df, s=60, alpha=0.7)
plt.title('Clustering des Morceaux (PCA)')
plt.savefig(os.path.join(artifact_dir, 'clustering_pca.png'))
plt.close()

# Radar Chart for Clusters
from math import pi
categories = audio_features
N = len(categories)
angles = [n / float(N) * 2 * pi for n in range(N)]
angles += angles[:1]

fig, ax = plt.subplots(figsize=(8, 8), subplot_kw=dict(polar=True))

for i, row in cluster_df.iterrows():
    values = row[categories].values.flatten().tolist()
    # normalize between 0 and 1 for radar display based on min/max of dataset
    norm_values = []
    for j, val in enumerate(values):
        col_min = df[categories[j]].min()
        col_max = df[categories[j]].max()
        norm_values.append((val - col_min) / (col_max - col_min) if col_max != col_min else 0)
    norm_values += norm_values[:1]
    ax.plot(angles, norm_values, linewidth=2, linestyle='solid', label=f'Cluster {i}')
    ax.fill(angles, norm_values, alpha=0.1)

ax.set_xticks(angles[:-1])
ax.set_xticklabels(categories)
plt.legend(loc='upper right', bbox_to_anchor=(0.1, 0.1))
plt.title('Profils des Clusters Musicaux')
plt.savefig(os.path.join(artifact_dir, 'cluster_radar.png'))
plt.close()

# Dump insights to JSON for the LLM to read
results = {
    'top_artists': top_artists,
    'top_genres': top_genres,
    'most_popular': most_popular,
    'extremes': extremes,
    'clusters': cluster_df.to_dict('records')
}

with open('analysis_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print("Analysis complete. Saved plots and analysis_results.json")

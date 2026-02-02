import React, { useState, useEffect } from 'react';
import { Wallet, TrendingUp, TrendingDown, Plus, X, Target, PiggyBank, Users, ShoppingCart, Home, Car, Utensils, Film, Heart, Zap, CreditCard, BarChart3, Filter } from 'lucide-react';

const BudgetApp = () => {
  const [salaires, setSalaires] = useState({ user: 0, conjoint: 0 });
  const [transactions, setTransactions] = useState([]);
  const [projets, setProjets] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeView, setActiveView] = useState('dashboard');
  const [filtreCategorie, setFiltreCategorie] = useState('toutes');
  const [conseilIA, setConseilIA] = useState('');
  const [loadingIA, setLoadingIA] = useState(false);
  const [objectif, setObjectif] = useState('');
  const [projetEnPaiement, setProjetEnPaiement] = useState(null);

  // Catégories avec icônes
  const categories = {
    'Alimentation': { icon: ShoppingCart, color: '#10b981' },
    'Logement': { icon: Home, color: '#3b82f6' },
    'Transport': { icon: Car, color: '#f59e0b' },
    'Restaurants': { icon: Utensils, color: '#ef4444' },
    'Divertissement': { icon: Film, color: '#8b5cf6' },
    'Santé': { icon: Heart, color: '#ec4899' },
    'Factures': { icon: Zap, color: '#06b6d4' },
    'Autre': { icon: CreditCard, color: '#6366f1' }
  };

  // Charger les données au démarrage
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const salairesData = await window.storage.get('budget-salaires');
      const transactionsData = await window.storage.get('budget-transactions');
      const projetsData = await window.storage.get('budget-projets');
      
      if (salairesData) setSalaires(JSON.parse(salairesData.value));
      if (transactionsData) setTransactions(JSON.parse(transactionsData.value));
      if (projetsData) setProjets(JSON.parse(projetsData.value));
    } catch (error) {
      console.log('Première utilisation - données vides');
    }
  };

  const saveData = async (key, data) => {
    try {
      await window.storage.set(key, JSON.stringify(data));
    } catch (error) {
      console.error('Erreur de sauvegarde:', error);
    }
  };

  const calculerTotaux = () => {
    const revenus = transactions
      .filter(t => t.type === 'revenu')
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);
    
    const depenses = transactions
      .filter(t => t.type === 'depense')
      .reduce((acc, t) => acc + parseFloat(t.montant), 0);
    
    const totalSalaires = parseFloat(salaires.user) + parseFloat(salaires.conjoint);
    const solde = totalSalaires + revenus - depenses;
    
    return { revenus: totalSalaires + revenus, depenses, solde };
  };

  const calculerParCategorie = () => {
    const stats = {};
    transactions
      .filter(t => t.type === 'depense')
      .forEach(t => {
        if (!stats[t.categorie]) {
          stats[t.categorie] = 0;
        }
        stats[t.categorie] += parseFloat(t.montant);
      });
    return stats;
  };

  const transactionsFiltrees = filtreCategorie === 'toutes' 
    ? transactions 
    : transactions.filter(t => t.categorie === filtreCategorie);

  const obtenirConseilIA = async () => {
    setLoadingIA(true);
    setConseilIA('');
    
    try {
      // Préparer les données financières
      const situationFinanciere = {
        revenus: totaux.revenus,
        depenses: totaux.depenses,
        solde: totaux.solde,
        projets: projets.map(p => ({
          nom: p.nom,
          type: p.type,
          montantTotal: p.montantTotal,
          montantActuel: p.montantActuel,
          restant: p.montantTotal - p.montantActuel,
          tauxInteret: p.tauxInteret || 0
        })),
        depensesParCategorie: statsCategories,
        nombreTransactions: transactions.length
      };

      const prompt = `Tu es un conseiller financier expert. Analyse cette situation financière et fournis des recommandations détaillées et personnalisées.

SITUATION FINANCIÈRE:
- Revenus mensuels totaux: ${situationFinanciere.revenus.toFixed(2)} $
- Dépenses mensuelles totales: ${situationFinanciere.depenses.toFixed(2)} $
- Solde disponible: ${situationFinanciere.solde.toFixed(2)} $

PROJETS ET DETTES:
${situationFinanciere.projets.length > 0 ? situationFinanciere.projets.map(p => {
  if (p.type === 'dette') {
    return `- [DETTE] ${p.nom}: ${p.restant.toFixed(2)} $ restants (${p.montantActuel.toFixed(2)}$ / ${p.montantTotal.toFixed(2)}$ payés) - Taux: ${p.tauxInteret}%`;
  } else {
    return `- [ÉPARGNE] ${p.nom}: ${p.montantActuel.toFixed(2)} $ épargnés (${p.restant.toFixed(2)}$ / ${p.montantTotal.toFixed(2)}$ restants)`;
  }
}).join('\n') : 'Aucun projet'}

DÉPENSES PAR CATÉGORIE:
${Object.entries(situationFinanciere.depensesParCategorie).map(([cat, montant]) => 
  `- ${cat}: ${montant.toFixed(2)} $ (${((montant / situationFinanciere.depenses) * 100).toFixed(1)}%)`
).join('\n')}

${objectif ? `OBJECTIF SPÉCIFIQUE: ${objectif}` : ''}

Fournis une analyse complète incluant:
1. 💰 Un plan de remboursement des dettes (si applicable) avec montants mensuels recommandés en tenant compte des intérêts
2. 🎯 Des stratégies pour atteindre les objectifs d'épargne (voyage, maison, etc.)
3. 📊 Des recommandations sur les catégories de dépenses à optimiser
4. 📅 Un calendrier réaliste pour atteindre les objectifs
5. 💡 Des conseils pratiques et actionnables

Sois encourageant, précis avec les chiffres, et donne des étapes concrètes.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            { role: "user", content: prompt }
          ],
        })
      });

      const data = await response.json();
      const texteConseil = data.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");
      
      setConseilIA(texteConseil);
    } catch (error) {
      setConseilIA("Désolé, je n'ai pas pu générer de conseil. Réessaie dans un instant.");
      console.error("Erreur IA:", error);
    } finally {
      setLoadingIA(false);
    }
  };

  const calculerPrevisionAnnuelle = () => {
    const previsions = [];
    const depensesMoyennes = totaux.depenses;
    const revenusMoyens = totaux.revenus;
    let soldeActuel = totaux.solde;
    
    // Copie des projets de type dette pour simulation
    let dettesSimulation = (projets || [])
      .filter(p => p && p.type === 'dette')
      .map(p => ({
        ...p,
        restant: (p.montantTotal || 0) - (p.montantActuel || 0)
      }));

    for (let mois = 1; mois <= 12; mois++) {
      // Calculer les intérêts mensuels sur les dettes
      let interetsMois = 0;
      dettesSimulation = dettesSimulation.map(d => {
        if (d.restant > 0 && d.tauxInteret) {
          const interetMensuel = (d.restant * (d.tauxInteret / 100)) / 12;
          interetsMois += interetMensuel;
          return {
            ...d,
            restant: d.restant + interetMensuel
          };
        }
        return d;
      });

      // Flux de trésorerie du mois
      const fluxMensuel = revenusMoyens - depensesMoyennes - interetsMois;
      soldeActuel += fluxMensuel;

      const totalDettes = dettesSimulation.reduce((sum, d) => sum + d.restant, 0);

      previsions.push({
        mois,
        revenus: revenusMoyens,
        depenses: depensesMoyennes,
        interets: interetsMois,
        flux: fluxMensuel,
        solde: soldeActuel,
        totalDettes: totalDettes
      });
    }

    return previsions;
  };

  const ajouterTransaction = () => {
    if (!formData.description || !formData.montant) return;
    
    const nouvelleTransaction = {
      id: Date.now(),
      ...formData,
      montant: parseFloat(formData.montant),
      date: new Date().toLocaleDateString('fr-CA')
    };
    
    const newTransactions = [...transactions, nouvelleTransaction];
    setTransactions(newTransactions);
    saveData('budget-transactions', newTransactions);
    setShowModal(null);
    setFormData({});
  };

  const ajouterProjet = () => {
    if (!formData.nom || !formData.montantTotal) return;
    
    const nouveauProjet = {
      id: Date.now(),
      nom: formData.nom,
      type: formData.type || 'dette', // 'dette' ou 'epargne'
      montantTotal: parseFloat(formData.montantTotal),
      montantActuel: 0, // Pour épargne c'est ce qu'on a épargné, pour dette c'est ce qu'on a payé
      tauxInteret: parseFloat(formData.tauxInteret || 0) // Taux d'intérêt annuel en % (pour dettes seulement)
    };
    
    const newProjets = [...projets, nouveauProjet];
    setProjets(newProjets);
    saveData('budget-projets', newProjets);
    setShowModal(null);
    setFormData({});
  };

  const ajouterMontantProjet = (id, montant) => {
    const newProjets = projets.map(p => {
      if (p.id === id) {
        return {
          ...p,
          montantActuel: Math.min(p.montantActuel + montant, p.montantTotal)
        };
      }
      return p;
    });
    setProjets(newProjets);
    saveData('budget-projets', newProjets);
  };

  const supprimerTransaction = (id) => {
    const newTransactions = transactions.filter(t => t.id !== id);
    setTransactions(newTransactions);
    saveData('budget-transactions', newTransactions);
  };

  const supprimerProjet = (id) => {
    const newProjets = projets.filter(p => p.id !== id);
    setProjets(newProjets);
    saveData('budget-projets', newProjets);
  };

  const sauvegarderSalaires = () => {
    setSalaires(formData);
    saveData('budget-salaires', formData);
    setShowModal(null);
    setFormData({});
  };

  const totaux = calculerTotaux();
  const statsCategories = calculerParCategorie();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '80px',
      fontFamily: "'Outfit', -apple-system, sans-serif"
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        
        * {
          -webkit-tap-highlight-color: transparent;
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .card {
          animation: slideUp 0.5s ease-out;
        }
        
        .progress-bar {
          transition: width 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        button {
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        
        button:active {
          transform: scale(0.95);
        }
        
        .transaction-item:active {
          background: rgba(255,255,255,0.15);
        }
        
        @media (max-width: 768px) {
          .hide-mobile {
            display: none;
          }
        }
      `}</style>

      <div style={{ 
        padding: '1rem',
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Header - Optimisé mobile */}
        <div style={{
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(20px)',
          borderRadius: '20px',
          padding: '1.25rem',
          marginBottom: '1rem',
          border: '1px solid rgba(255,255,255,0.2)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 5vw, 2rem)',
                fontWeight: '700',
                color: 'white',
                margin: '0 0 0.25rem 0',
                letterSpacing: '-0.02em'
              }}>
                💰 Budget Familial
              </h1>
              <p style={{
                color: 'rgba(255,255,255,0.8)',
                margin: 0,
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                {activeView === 'dashboard' && 'Vue d\'ensemble'}
                {activeView === 'transactions' && 'Transactions'}
                {activeView === 'projets' && 'Projets & Objectifs'}
                {activeView === 'stats' && 'Statistiques'}
                {activeView === 'previsions' && 'Prévisions'}
                {activeView === 'assistant' && 'Assistant IA'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowModal('salaires');
                setFormData(salaires);
              }}
              style={{
                background: 'white',
                color: '#667eea',
                border: 'none',
                padding: 'clamp(0.75rem, 2vw, 1rem)',
                borderRadius: '12px',
                fontSize: 'clamp(0.875rem, 2vw, 1rem)',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
              }}
            >
              <Users size={18} />
              <span className="hide-mobile">Salaires</span>
            </button>
          </div>
        </div>

        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <>
            {/* Cartes de résumé - Optimisées mobile */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '0.75rem',
              marginBottom: '1rem'
            }}>
              <div className="card" style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '16px',
                padding: '1.25rem',
                color: 'white',
                boxShadow: '0 4px 16px rgba(102,126,234,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <TrendingUp size={20} />
                </div>
                <p style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '0.75rem',
                  opacity: 0.9
                }}>
                  Revenus
                </p>
                <p style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: "'Space Mono', monospace"
                }}>
                  {totaux.revenus.toFixed(0)} $
                </p>
              </div>

              <div className="card" style={{
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                borderRadius: '16px',
                padding: '1.25rem',
                color: 'white',
                boxShadow: '0 4px 16px rgba(240,147,251,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <TrendingDown size={20} />
                </div>
                <p style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '0.75rem',
                  opacity: 0.9
                }}>
                  Dépenses
                </p>
                <p style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: "'Space Mono', monospace"
                }}>
                  {totaux.depenses.toFixed(0)} $
                </p>
              </div>

              <div className="card" style={{
                background: totaux.solde >= 0 
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                  : 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                borderRadius: '16px',
                padding: '1.25rem',
                color: 'white',
                boxShadow: '0 4px 16px rgba(79,172,254,0.3)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <Wallet size={20} />
                </div>
                <p style={{
                  margin: '0 0 0.25rem 0',
                  fontSize: '0.75rem',
                  opacity: 0.9
                }}>
                  Solde
                </p>
                <p style={{
                  fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                  fontWeight: '700',
                  margin: 0,
                  fontFamily: "'Space Mono', monospace"
                }}>
                  {totaux.solde.toFixed(0)} $
                </p>
              </div>
            </div>

            {/* Aperçu transactions récentes */}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '20px',
              padding: '1.25rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
              }}>
                <h2 style={{
                  margin: 0,
                  fontSize: 'clamp(1.125rem, 4vw, 1.25rem)',
                  fontWeight: '600',
                  color: '#2d3748'
                }}>
                  📊 Dernières transactions
                </h2>
                <button
                  onClick={() => setActiveView('transactions')}
                  style={{
                    background: 'transparent',
                    color: '#667eea',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    padding: '0.5rem'
                  }}
                >
                  Voir tout →
                </button>
              </div>
              {transactions.slice(-3).reverse().map((t) => {
                const CategoryIcon = categories[t.categorie]?.icon || CreditCard;
                return (
                  <div
                    key={t.id}
                    style={{
                      padding: '0.875rem',
                      borderRadius: '12px',
                      marginBottom: '0.5rem',
                      background: t.type === 'revenu' ? 'rgba(102,126,234,0.05)' : 'rgba(245,87,108,0.05)',
                      border: '1px solid',
                      borderColor: t.type === 'revenu' ? 'rgba(102,126,234,0.1)' : 'rgba(245,87,108,0.1)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                      <div style={{
                        background: categories[t.categorie]?.color || '#6366f1',
                        padding: '0.5rem',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <CategoryIcon size={16} color="white" />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p style={{ 
                          margin: '0 0 0.125rem 0', 
                          fontWeight: '600', 
                          color: '#2d3748',
                          fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {t.description}
                        </p>
                        <p style={{ 
                          margin: 0, 
                          fontSize: 'clamp(0.75rem, 2vw, 0.875rem)', 
                          color: '#718096' 
                        }}>
                          {t.categorie}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      fontWeight: '700',
                      fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                      color: t.type === 'revenu' ? '#667eea' : '#f5576c',
                      fontFamily: "'Space Mono', monospace",
                      flexShrink: 0,
                      marginLeft: '0.5rem'
                    }}>
                      {t.type === 'revenu' ? '+' : '-'}{t.montant.toFixed(0)} $
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Aperçu projets */}
            {projets.length > 0 && (
              <div style={{
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '20px',
                padding: '1.25rem',
                boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1rem'
                }}>
                  <h2 style={{
                    margin: 0,
                    fontSize: 'clamp(1.125rem, 4vw, 1.25rem)',
                    fontWeight: '600',
                    color: '#2d3748'
                  }}>
                    🎯 Progression projets
                  </h2>
                  <button
                    onClick={() => setActiveView('projets')}
                    style={{
                      background: 'transparent',
                      color: '#667eea',
                      border: 'none',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.875rem',
                      padding: '0.5rem'
                    }}
                  >
                    Voir tout →
                  </button>
                </div>
                {projets.slice(0, 2).map((d) => {
                  const progression = (d.montantActuel / d.montantTotal) * 100;
                  return (
                    <div
                      key={d.id}
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '0.75rem',
                        background: 'rgba(102,126,234,0.05)',
                        border: '1px solid rgba(102,126,234,0.1)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '0.75rem'
                      }}>
                        <h3 style={{ 
                          margin: 0, 
                          color: '#2d3748', 
                          fontWeight: '600',
                          fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                        }}>
                          {d.nom}
                        </h3>
                        <span style={{
                          fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                          fontWeight: '700',
                          color: progression === 100 ? '#22c55e' : '#667eea'
                        }}>
                          {progression.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '999px',
                        height: '8px',
                        overflow: 'hidden'
                      }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${progression}%`,
                            height: '100%',
                            background: progression === 100 
                              ? 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)'
                              : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '999px'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Transactions View */}
        {activeView === 'transactions' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                📊 Toutes les transactions
              </h2>
              <button
                onClick={() => {
                  setShowModal('transaction');
                  setFormData({ type: 'depense', categorie: 'Alimentation' });
                }}
                style={{
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>

            {/* Filtre par catégorie */}
            <div style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              marginBottom: '1rem',
              paddingBottom: '0.5rem'
            }}>
              <button
                onClick={() => setFiltreCategorie('toutes')}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '20px',
                  border: 'none',
                  background: filtreCategorie === 'toutes' ? '#667eea' : 'rgba(0,0,0,0.05)',
                  color: filtreCategorie === 'toutes' ? 'white' : '#4a5568',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.875rem',
                  whiteSpace: 'nowrap',
                  flexShrink: 0
                }}
              >
                Toutes
              </button>
              {Object.keys(categories).map(cat => (
                <button
                  key={cat}
                  onClick={() => setFiltreCategorie(cat)}
                  style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '20px',
                    border: 'none',
                    background: filtreCategorie === cat ? categories[cat].color : 'rgba(0,0,0,0.05)',
                    color: filtreCategorie === cat ? 'white' : '#4a5568',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.875rem',
                    whiteSpace: 'nowrap',
                    flexShrink: 0
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {transactionsFiltrees.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>
                  Aucune transaction
                </p>
              ) : (
                transactionsFiltrees.map((t) => {
                  const CategoryIcon = categories[t.categorie]?.icon || CreditCard;
                  return (
                    <div
                      key={t.id}
                      className="transaction-item"
                      style={{
                        padding: '1rem',
                        borderRadius: '12px',
                        marginBottom: '0.75rem',
                        background: t.type === 'revenu' ? 'rgba(102,126,234,0.05)' : 'rgba(245,87,108,0.05)',
                        border: '1px solid',
                        borderColor: t.type === 'revenu' ? 'rgba(102,126,234,0.1)' : 'rgba(245,87,108,0.1)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '0.75rem'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                        <div style={{
                          background: categories[t.categorie]?.color || '#6366f1',
                          padding: '0.625rem',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <CategoryIcon size={18} color="white" />
                        </div>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p style={{ 
                            margin: '0 0 0.125rem 0', 
                            fontWeight: '600', 
                            color: '#2d3748',
                            fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {t.description}
                          </p>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: '#718096' }}>
                            {t.categorie} • {t.date}
                          </p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                        <span style={{
                          fontWeight: '700',
                          fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                          color: t.type === 'revenu' ? '#667eea' : '#f5576c',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          {t.type === 'revenu' ? '+' : '-'}{t.montant.toFixed(0)} $
                        </span>
                        <button
                          onClick={() => supprimerTransaction(t.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e53e3e',
                            padding: '0.25rem',
                            display: 'flex',
                            alignItems: 'center'
                          }}
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Dettes View */}
        {activeView === 'projets' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.75rem'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                fontWeight: '600',
                color: '#2d3748'
              }}>
                🎯 Projets & Objectifs
              </h2>
              <button
                onClick={() => {
                  setShowModal('projet');
                  setFormData({ type: 'dette' });
                }}
                style={{
                  background: '#f5576c',
                  color: 'white',
                  border: 'none',
                  padding: '0.875rem 1.25rem',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                <Plus size={18} />
                Ajouter
              </button>
            </div>

            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {projets.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>
                  Aucun projet enregistré
                </p>
              ) : (
                projets.map((p) => {
                  const progression = (p.montantActuel / p.montantTotal) * 100;
                  const restant = p.montantTotal - p.montantActuel;
                  const interetMensuel = p.tauxInteret ? (restant * (p.tauxInteret / 100)) / 12 : 0;
                  
                  return (
                    <div
                      key={p.id}
                      style={{
                        padding: '1.25rem',
                        borderRadius: '16px',
                        marginBottom: '1rem',
                        background: 'linear-gradient(135deg, rgba(102,126,234,0.05) 0%, rgba(118,75,162,0.05) 100%)',
                        border: '1px solid rgba(102,126,234,0.1)'
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <div style={{ flex: 1 }}>
                          <h3 style={{ 
                            margin: '0 0 0.25rem 0', 
                            color: '#2d3748', 
                            fontWeight: '600',
                            fontSize: 'clamp(1rem, 4vw, 1.125rem)'
                          }}>
                            {p.nom}
                          </h3>
                          {p.tauxInteret > 0 && (
                            <p style={{
                              margin: 0,
                              fontSize: '0.75rem',
                              color: '#d97706',
                              fontWeight: '600'
                            }}>
                              📊 {p.tauxInteret}% annuel • ~{interetMensuel.toFixed(2)}$/mois d'intérêts
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => supprimerProjet(p.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e53e3e',
                            padding: '0.25rem',
                            flexShrink: 0
                          }}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div style={{
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '999px',
                        height: '12px',
                        overflow: 'hidden',
                        marginBottom: '1rem'
                      }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${progression}%`,
                            height: '100%',
                            background: progression === 100 
                              ? 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)'
                              : 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '999px'
                          }}
                        />
                      </div>

                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '1rem'
                      }}>
                        <div>
                          <p style={{
                            margin: '0 0 0.25rem 0',
                            fontSize: '0.875rem',
                            color: '#718096'
                          }}>
                            Payé: {p.montantActuel.toFixed(0)} $ / {p.montantTotal.toFixed(0)} $
                          </p>
                          <p style={{
                            margin: 0,
                            fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                            fontWeight: '700',
                            color: '#667eea',
                            fontFamily: "'Space Mono', monospace"
                          }}>
                            Restant: {restant.toFixed(0)} $
                          </p>
                        </div>
                        <span style={{
                          fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                          fontWeight: '700',
                          color: progression === 100 ? '#22c55e' : '#667eea'
                        }}>
                          {progression.toFixed(0)}%
                        </span>
                      </div>

                      {progression < 100 && (
                        <button
                          onClick={() => {
                            setProjetEnPaiement(p);
                            setFormData({ montantPaiement: '' });
                          }}
                          style={{
                            background: '#667eea',
                            color: 'white',
                            border: 'none',
                            padding: '0.875rem',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            width: '100%',
                            fontWeight: '600',
                            fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                          }}
                        >
                          💳 Effectuer un paiement
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Statistics View */}
        {activeView === 'stats' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
              fontWeight: '600',
              color: '#2d3748'
            }}>
              📈 Dépenses par catégorie
            </h2>

            <div style={{ marginBottom: '1.5rem' }}>
              {Object.entries(statsCategories).length === 0 ? (
                <p style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>
                  Aucune dépense enregistrée
                </p>
              ) : (
                Object.entries(statsCategories)
                  .sort((a, b) => b[1] - a[1])
                  .map(([cat, montant]) => {
                    const CategoryIcon = categories[cat]?.icon || CreditCard;
                    const pourcentage = (montant / totaux.depenses) * 100;
                    
                    return (
                      <div
                        key={cat}
                        style={{
                          marginBottom: '1rem',
                          padding: '1rem',
                          borderRadius: '12px',
                          background: 'rgba(0,0,0,0.02)',
                          border: '1px solid rgba(0,0,0,0.05)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '0.75rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                              background: categories[cat]?.color || '#6366f1',
                              padding: '0.625rem',
                              borderRadius: '10px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <CategoryIcon size={18} color="white" />
                            </div>
                            <span style={{
                              fontWeight: '600',
                              color: '#2d3748',
                              fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                            }}>
                              {cat}
                            </span>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{
                              margin: '0 0 0.125rem 0',
                              fontWeight: '700',
                              fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                              color: '#2d3748',
                              fontFamily: "'Space Mono', monospace"
                            }}>
                              {montant.toFixed(0)} $
                            </p>
                            <p style={{
                              margin: 0,
                              fontSize: '0.75rem',
                              color: '#718096'
                            }}>
                              {pourcentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                        <div style={{
                          background: 'rgba(0,0,0,0.05)',
                          borderRadius: '999px',
                          height: '8px',
                          overflow: 'hidden'
                        }}>
                          <div
                            style={{
                              width: `${pourcentage}%`,
                              height: '100%',
                              background: categories[cat]?.color || '#6366f1',
                              borderRadius: '999px',
                              transition: 'width 0.8s ease'
                            }}
                          />
                        </div>
                      </div>
                    );
                  })
              )}
            </div>

            {/* Résumé total */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: 'white',
              textAlign: 'center'
            }}>
              <p style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.875rem',
                opacity: 0.9
              }}>
                Total des dépenses
              </p>
              <p style={{
                margin: 0,
                fontSize: 'clamp(2rem, 8vw, 2.5rem)',
                fontWeight: '700',
                fontFamily: "'Space Mono', monospace"
              }}>
                {totaux.depenses.toFixed(2)} $
              </p>
            </div>
          </div>
        )}

        {/* AI Assistant View */}
        {activeView === 'assistant' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
              fontWeight: '600',
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🤖 Assistant Financier IA
            </h2>

            <div style={{
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(102,126,234,0.2)'
            }}>
              <p style={{
                margin: '0 0 0.75rem 0',
                color: '#2d3748',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                lineHeight: 1.6
              }}>
                Obtiens des recommandations personnalisées basées sur ta situation financière actuelle.
              </p>
              
              <div style={{ marginBottom: '1rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#4a5568',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}>
                  Objectif spécifique (optionnel)
                </label>
                <input
                  type="text"
                  value={objectif}
                  onChange={(e) => setObjectif(e.target.value)}
                  placeholder="Ex: Épargner 5000$ pour des vacances"
                  style={{
                    width: '100%',
                    padding: 'clamp(0.75rem, 2.5vw, 0.875rem)',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                onClick={obtenirConseilIA}
                disabled={loadingIA || transactions.length === 0}
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: 'none',
                  background: loadingIA ? '#cbd5e0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  cursor: loadingIA || transactions.length === 0 ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {loadingIA ? '⏳ Analyse en cours...' : '✨ Obtenir des conseils'}
              </button>
              
              {transactions.length === 0 && (
                <p style={{
                  margin: '0.75rem 0 0 0',
                  fontSize: '0.875rem',
                  color: '#e53e3e',
                  textAlign: 'center'
                }}>
                  Ajoute des transactions pour obtenir des conseils personnalisés
                </p>
              )}
            </div>

            {conseilIA && (
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.25rem',
                border: '2px solid #667eea',
                boxShadow: '0 4px 12px rgba(102,126,234,0.15)',
                maxHeight: '60vh',
                overflowY: 'auto'
              }}>
                <div style={{
                  color: '#2d3748',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap'
                }}>
                  {conseilIA}
                </div>
              </div>
            )}

            {!conseilIA && !loadingIA && (
              <div style={{
                textAlign: 'center',
                padding: '3rem 1rem',
                color: '#a0aec0'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💡</div>
                <p style={{ margin: 0, fontSize: 'clamp(0.875rem, 3vw, 1rem)' }}>
                  Clique sur le bouton ci-dessus pour recevoir<br />des conseils personnalisés
                </p>
              </div>
            )}
          </div>
        )}

        {/* Annual Forecast View */}
        {activeView === 'previsions' && (
          <div style={{
            background: 'rgba(255,255,255,0.95)',
            borderRadius: '20px',
            padding: '1.25rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{
              margin: '0 0 1rem 0',
              fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
              fontWeight: '600',
              color: '#2d3748',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📅 Prévisions annuelles
            </h2>

            <div style={{
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: '16px',
              padding: '1.25rem',
              marginBottom: '1.25rem',
              border: '1px solid rgba(102,126,234,0.2)'
            }}>
              <p style={{
                margin: 0,
                color: '#4a5568',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                lineHeight: 1.6
              }}>
                Projection sur 12 mois basée sur tes revenus et dépenses moyens actuels. 
                {projets.some(p => p.type === 'dette' && p.tauxInteret > 0) && ' Les intérêts sur les dettes sont calculés automatiquement.'}
              </p>
            </div>

            <div style={{ 
              maxHeight: '65vh', 
              overflowY: 'auto',
              overflowX: 'auto'
            }}>
              {calculerPrevisionAnnuelle().map((prev, index) => {
                const moisNoms = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
                const isPositif = prev.flux >= 0;
                
                return (
                  <div
                    key={prev.mois}
                    style={{
                      padding: '1rem',
                      borderRadius: '12px',
                      marginBottom: '0.75rem',
                      background: index === 0 
                        ? 'linear-gradient(135deg, rgba(102,126,234,0.15) 0%, rgba(118,75,162,0.15) 100%)'
                        : 'rgba(0,0,0,0.02)',
                      border: '1px solid',
                      borderColor: index === 0 ? 'rgba(102,126,234,0.3)' : 'rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.75rem'
                    }}>
                      <h3 style={{
                        margin: 0,
                        fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                        fontWeight: '600',
                        color: '#2d3748'
                      }}>
                        {index === 0 ? '📍 ' : ''}{moisNoms[prev.mois - 1]} (Mois {prev.mois})
                      </h3>
                      <span style={{
                        fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                        fontWeight: '700',
                        color: prev.solde >= 0 ? '#10b981' : '#ef4444',
                        fontFamily: "'Space Mono', monospace"
                      }}>
                        {prev.solde.toFixed(0)} $
                      </span>
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '0.75rem',
                      marginBottom: '0.75rem'
                    }}>
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.2)'
                      }}>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.75rem',
                          color: '#059669',
                          fontWeight: '600'
                        }}>
                          Revenus
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                          fontWeight: '700',
                          color: '#059669',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          +{prev.revenus.toFixed(0)} $
                        </p>
                      </div>

                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.2)'
                      }}>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.75rem',
                          color: '#dc2626',
                          fontWeight: '600'
                        }}>
                          Dépenses
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                          fontWeight: '700',
                          color: '#dc2626',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          -{prev.depenses.toFixed(0)} $
                        </p>
                      </div>
                    </div>

                    {prev.interets > 0 && (
                      <div style={{
                        padding: '0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(245,158,11,0.1)',
                        border: '1px solid rgba(245,158,11,0.2)',
                        marginBottom: '0.75rem'
                      }}>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.75rem',
                          color: '#d97706',
                          fontWeight: '600'
                        }}>
                          💳 Intérêts sur dettes
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                          fontWeight: '700',
                          color: '#d97706',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          -{prev.interets.toFixed(2)} $
                        </p>
                      </div>
                    )}

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: isPositif ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      border: '1px solid',
                      borderColor: isPositif ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'
                    }}>
                      <span style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: isPositif ? '#059669' : '#dc2626'
                      }}>
                        {isPositif ? '📈 Surplus' : '📉 Déficit'}
                      </span>
                      <span style={{
                        fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                        fontWeight: '700',
                        color: isPositif ? '#059669' : '#dc2626',
                        fontFamily: "'Space Mono', monospace"
                      }}>
                        {isPositif ? '+' : ''}{prev.flux.toFixed(0)} $
                      </span>
                    </div>

                    {prev.totalDettes > 0 && (
                      <div style={{
                        marginTop: '0.75rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(0,0,0,0.03)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{
                          fontSize: '0.75rem',
                          color: '#718096'
                        }}>
                          Total dettes restantes
                        </span>
                        <span style={{
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          color: '#4a5568',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          {prev.totalDettes.toFixed(0)} $
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Résumé annuel */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '1.5rem',
              color: 'white',
              marginTop: '1rem'
            }}>
              <h3 style={{
                margin: '0 0 1rem 0',
                fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                fontWeight: '600'
              }}>
                📊 Résumé annuel projeté
              </h3>
              
              {(() => {
                const prevs = calculerPrevisionAnnuelle();
                const dernierMois = prevs[prevs.length - 1];
                const totalInterets = prevs.reduce((sum, p) => sum + p.interets, 0);
                const soldeInitial = totaux.solde;
                const soldeFinal = dernierMois.solde;
                const evolution = soldeFinal - soldeInitial;
                
                return (
                  <>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '1rem'
                    }}>
                      <div>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.875rem',
                          opacity: 0.9
                        }}>
                          Solde actuel
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                          fontWeight: '700',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          {soldeInitial.toFixed(0)} $
                        </p>
                      </div>
                      
                      <div>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.875rem',
                          opacity: 0.9
                        }}>
                          Solde dans 12 mois
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                          fontWeight: '700',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          {soldeFinal.toFixed(0)} $
                        </p>
                      </div>
                    </div>

                    <div style={{
                      marginTop: '1rem',
                      padding: '1rem',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.15)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                          {evolution >= 0 ? '📈 Croissance prévue' : '📉 Diminution prévue'}
                        </span>
                        <span style={{
                          fontSize: 'clamp(1rem, 4vw, 1.25rem)',
                          fontWeight: '700',
                          fontFamily: "'Space Mono', monospace"
                        }}>
                          {evolution >= 0 ? '+' : ''}{evolution.toFixed(0)} $
                        </span>
                      </div>
                      
                      {totalInterets > 0 && (
                        <div style={{
                          marginTop: '0.75rem',
                          paddingTop: '0.75rem',
                          borderTop: '1px solid rgba(255,255,255,0.2)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                            💳 Total intérêts
                          </span>
                          <span style={{
                            fontSize: '1rem',
                            fontWeight: '700',
                            fontFamily: "'Space Mono', monospace"
                          }}>
                            -{totalInterets.toFixed(2)} $
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>

      {/* Navigation mobile en bas */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.98)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0,0,0,0.1)',
        padding: '0.5rem 0 calc(0.5rem + env(safe-area-inset-bottom))',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
        zIndex: 1000
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '0.25rem',
          maxWidth: '700px',
          margin: '0 auto',
          padding: '0 0.5rem'
        }}>
          <button
            onClick={() => setActiveView('dashboard')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.25rem',
              color: activeView === 'dashboard' ? '#667eea' : '#718096',
              fontWeight: activeView === 'dashboard' ? '600' : '400',
              fontSize: '0.65rem'
            }}
          >
            <Wallet size={20} />
            <span>Accueil</span>
          </button>
          
          <button
            onClick={() => setActiveView('transactions')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.25rem',
              color: activeView === 'transactions' ? '#667eea' : '#718096',
              fontWeight: activeView === 'transactions' ? '600' : '400',
              fontSize: '0.65rem'
            }}
          >
            <CreditCard size={20} />
            <span>Transactions</span>
          </button>
          
          <button
            onClick={() => setActiveView('stats')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.25rem',
              color: activeView === 'stats' ? '#667eea' : '#718096',
              fontWeight: activeView === 'stats' ? '600' : '400',
              fontSize: '0.65rem'
            }}
          >
            <BarChart3 size={20} />
            <span>Stats</span>
          </button>
          
          <button
            onClick={() => setActiveView('projets')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.25rem',
              color: activeView === 'projets' ? '#667eea' : '#718096',
              fontWeight: activeView === 'projets' ? '600' : '400',
              fontSize: '0.65rem'
            }}
          >
            <Target size={20} />
            <span>Projets</span>
          </button>

          <button
            onClick={() => setActiveView('previsions')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.25rem',
              color: activeView === 'previsions' ? '#667eea' : '#718096',
              fontWeight: activeView === 'previsions' ? '600' : '400',
              fontSize: '0.65rem'
            }}
          >
            <TrendingUp size={20} />
            <span>Prévisions</span>
          </button>

          <button
            onClick={() => setActiveView('assistant')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.25rem',
              padding: '0.5rem 0.25rem',
              color: activeView === 'assistant' ? '#667eea' : '#718096',
              fontWeight: activeView === 'assistant' ? '600' : '400',
              fontSize: '0.65rem'
            }}
          >
            <PiggyBank size={20} />
            <span>Conseils</span>
          </button>
        </div>
      </div>

      {/* Modales */}
      {showModal === 'salaires' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ 
              marginTop: 0, 
              color: '#2d3748', 
              fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' 
            }}>
              💼 Configuration des salaires
            </h2>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Votre salaire mensuel
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.user || ''}
                onChange={(e) => setFormData({...formData, user: e.target.value})}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                  fontFamily: "'Space Mono', monospace",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Salaire de votre conjoint(e)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.conjoint || ''}
                onChange={(e) => setFormData({...formData, conjoint: e.target.value})}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                  fontFamily: "'Space Mono', monospace",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowModal(null);
                  setFormData({});
                }}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#4a5568',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Annuler
              </button>
              <button
                onClick={sauvegarderSalaires}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#667eea',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'transaction' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              marginTop: 0, 
              color: '#2d3748', 
              fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' 
            }}>
              ➕ Nouvelle transaction
            </h2>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Type
              </label>
              <select
                value={formData.type || 'depense'}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  boxSizing: 'border-box'
                }}
              >
                <option value="depense">💸 Dépense</option>
                <option value="revenu">💰 Revenu</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Description
              </label>
              <input
                type="text"
                value={formData.description || ''}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Ex: Épicerie"
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Catégorie
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
                gap: '0.75rem'
              }}>
                {Object.entries(categories).map(([cat, { icon: Icon, color }]) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData({...formData, categorie: cat})}
                    style={{
                      padding: '0.875rem 0.5rem',
                      borderRadius: '12px',
                      border: '2px solid',
                      borderColor: formData.categorie === cat ? color : '#e2e8f0',
                      background: formData.categorie === cat ? `${color}15` : 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.375rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{
                      background: formData.categorie === cat ? color : '#e2e8f0',
                      padding: '0.5rem',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Icon size={18} color={formData.categorie === cat ? 'white' : '#718096'} />
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: formData.categorie === cat ? '600' : '400',
                      color: formData.categorie === cat ? color : '#4a5568',
                      textAlign: 'center',
                      lineHeight: 1.2
                    }}>
                      {cat}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Montant
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.montant || ''}
                onChange={(e) => setFormData({...formData, montant: e.target.value})}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                  fontFamily: "'Space Mono', monospace",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowModal(null);
                  setFormData({});
                }}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#4a5568',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Annuler
              </button>
              <button
                onClick={ajouterTransaction}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#667eea',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal === 'projet' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ 
              marginTop: 0, 
              color: '#2d3748', 
              fontSize: 'clamp(1.25rem, 5vw, 1.75rem)' 
            }}>
              🎯 Nouveau projet
            </h2>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.75rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Type de projet
              </label>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '0.75rem'
              }}>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'dette'})}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: formData.type === 'dette' ? '#f5576c' : '#e2e8f0',
                    background: formData.type === 'dette' ? 'rgba(245,87,108,0.1)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>💳</div>
                  <span style={{
                    fontWeight: formData.type === 'dette' ? '700' : '600',
                    color: formData.type === 'dette' ? '#f5576c' : '#4a5568',
                    fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                  }}>
                    Dette à rembourser
                  </span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({...formData, type: 'epargne'})}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    border: '2px solid',
                    borderColor: formData.type === 'epargne' ? '#667eea' : '#e2e8f0',
                    background: formData.type === 'epargne' ? 'rgba(102,126,234,0.1)' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <div style={{ fontSize: '2rem' }}>🎯</div>
                  <span style={{
                    fontWeight: formData.type === 'epargne' ? '700' : '600',
                    color: formData.type === 'epargne' ? '#667eea' : '#4a5568',
                    fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                  }}>
                    Objectif d'épargne
                  </span>
                </button>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                {formData.type === 'epargne' ? 'Nom de l\'objectif' : 'Nom de la dette'}
              </label>
              <input
                type="text"
                value={formData.nom || ''}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder={formData.type === 'epargne' ? "Ex: Voyage en Europe" : "Ex: Carte de crédit"}
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                {formData.type === 'epargne' ? 'Montant cible' : 'Montant total'}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.montantTotal || ''}
                onChange={(e) => setFormData({...formData, montantTotal: e.target.value})}
                placeholder="0.00"
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(1rem, 4vw, 1.125rem)',
                  fontFamily: "'Space Mono', monospace",
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {formData.type === 'dette' && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  color: '#4a5568',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}>
                  Taux d'intérêt annuel (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.tauxInteret || ''}
                  onChange={(e) => setFormData({...formData, tauxInteret: e.target.value})}
                  placeholder="Ex: 19.99"
                  style={{
                    width: '100%',
                    padding: 'clamp(0.875rem, 3vw, 1rem)',
                    borderRadius: '12px',
                    border: '2px solid #e2e8f0',
                    fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                    boxSizing: 'border-box'
                  }}
                />
                <p style={{
                  margin: '0.5rem 0 0 0',
                  fontSize: '0.75rem',
                  color: '#718096'
                }}>
                  💡 Le taux d'intérêt est utilisé pour calculer les intérêts dans les prévisions
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setShowModal(null);
                  setFormData({});
                }}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#4a5568',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Annuler
              </button>
              <button
                onClick={ajouterProjet}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: 'none',
                  background: '#f5576c',
                  color: 'white',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Ajouter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de paiement de dette */}
      {projetEnPaiement && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '24px',
            padding: 'clamp(1.5rem, 5vw, 2.5rem)',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h2 style={{ 
              marginTop: 0, 
              color: '#2d3748', 
              fontSize: 'clamp(1.25rem, 5vw, 1.75rem)',
              marginBottom: '0.5rem'
            }}>
              💳 Paiement sur dette
            </h2>
            
            <div style={{
              background: 'linear-gradient(135deg, rgba(102,126,234,0.1) 0%, rgba(118,75,162,0.1) 100%)',
              borderRadius: '16px',
              padding: '1rem',
              marginBottom: '1.5rem',
              border: '1px solid rgba(102,126,234,0.2)'
            }}>
              <p style={{
                margin: '0 0 0.5rem 0',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)',
                color: '#4a5568',
                fontWeight: '600'
              }}>
                {projetEnPaiement.nom}
              </p>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <span style={{
                  fontSize: '0.875rem',
                  color: '#718096'
                }}>
                  Montant restant
                </span>
                <span style={{
                  fontSize: 'clamp(1.25rem, 5vw, 1.5rem)',
                  fontWeight: '700',
                  color: '#667eea',
                  fontFamily: "'Space Mono', monospace"
                }}>
                  {(projetEnPaiement.montantTotal - projetEnPaiement.montantPaye).toFixed(2)} $
                </span>
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: '#4a5568',
                fontWeight: '600',
                fontSize: 'clamp(0.875rem, 3vw, 1rem)'
              }}>
                Montant du paiement
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.montantPaiement || ''}
                onChange={(e) => setFormData({...formData, montantPaiement: e.target.value})}
                placeholder="0.00"
                autoFocus
                style={{
                  width: '100%',
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  fontSize: 'clamp(1.125rem, 5vw, 1.25rem)',
                  fontFamily: "'Space Mono', monospace",
                  boxSizing: 'border-box'
                }}
              />
              <p style={{
                margin: '0.5rem 0 0 0',
                fontSize: '0.75rem',
                color: '#718096'
              }}>
                💡 Entre le montant que tu as déposé sur cette dette
              </p>
            </div>

            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}>
              {[50, 100, 200].map(montant => (
                <button
                  key={montant}
                  onClick={() => setFormData({...formData, montantPaiement: montant})}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: '10px',
                    border: '2px solid #e2e8f0',
                    background: 'white',
                    color: '#667eea',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                  }}
                >
                  +{montant}$
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => {
                  setProjetEnPaiement(null);
                  setFormData({});
                }}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: '2px solid #e2e8f0',
                  background: 'white',
                  color: '#4a5568',
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  const montant = parseFloat(formData.montantPaiement);
                  if (!isNaN(montant) && montant > 0) {
                    ajouterMontantProjet(projetEnPaiement.id, montant);
                    setProjetEnPaiement(null);
                    setFormData({});
                  }
                }}
                disabled={!formData.montantPaiement || parseFloat(formData.montantPaiement) <= 0}
                style={{
                  flex: 1,
                  padding: 'clamp(0.875rem, 3vw, 1rem)',
                  borderRadius: '12px',
                  border: 'none',
                  background: (!formData.montantPaiement || parseFloat(formData.montantPaiement) <= 0) ? '#cbd5e0' : '#667eea',
                  color: 'white',
                  cursor: (!formData.montantPaiement || parseFloat(formData.montantPaiement) <= 0) ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: 'clamp(0.875rem, 3vw, 1rem)'
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetApp;
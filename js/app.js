// Main Budget App Component
const { useState, useEffect } = React;

// Destructure components from global object
const { SummaryCard, ActionButton, TransactionList, categories } = window.Components;
const { Wallet, TrendingUp, TrendingDown, Users, Plus } = window.Icons;

function BudgetApp() {
  const [salaires, setSalaires] = useState({ user: 0, conjoint: 0 });
  const [transactions, setTransactions] = useState([]);
  const [projets, setProjets] = useState([]);
  const [showModal, setShowModal] = useState(null);
  const [formData, setFormData] = useState({});
  const [activeView, setActiveView] = useState('dashboard');
  const [filtreCategorie, setFiltreCategorie] = useState('toutes');
  const [projetEnPaiement, setProjetEnPaiement] = useState(null);

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
      console.log('Première utilisation');
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
    
    const totalSalaires = parseFloat(salaires.user || 0) + parseFloat(salaires.conjoint || 0);
    const solde = totalSalaires + revenus - depenses;
    
    return { revenus: totalSalaires + revenus, depenses, solde };
  };

  const totaux = calculerTotaux();

  // Render UI
  return React.createElement('div', {
    style: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      paddingBottom: '80px'
    }
  }, 
    React.createElement('div', {
      style: {
        padding: '2rem 1rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }
    }, [
      // Title
      React.createElement('h1', {
        key: 'title',
        style: {
          color: 'white',
          textAlign: 'center',
          marginBottom: '2rem',
          fontSize: '2rem',
          fontWeight: '600'
        }
      }, '💰 Budget Familial'),

      // Summary Cards
      React.createElement('div', {
        key: 'summary',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }
      }, [
        React.createElement(SummaryCard, {
          key: 'revenus',
          icon: TrendingUp,
          label: 'Revenus',
          value: `${totaux.revenus.toFixed(0)} $`,
          color: '#10b981'
        }),
        React.createElement(SummaryCard, {
          key: 'depenses',
          icon: TrendingDown,
          label: 'Dépenses',
          value: `${totaux.depenses.toFixed(0)} $`,
          color: '#ef4444'
        }),
        React.createElement(SummaryCard, {
          key: 'disponible',
          icon: Wallet,
          label: 'Disponible',
          value: `${totaux.solde.toFixed(0)} $`,
          color: totaux.solde >= 0 ? '#10b981' : '#ef4444'
        })
      ]),

      // Action Buttons
      React.createElement('div', {
        key: 'actions',
        style: {
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '1rem'
        }
      }, [
        React.createElement(ActionButton, {
          key: 'salaires',
          icon: Users,
          label: 'Configurer salaires',
          onClick: () => setShowModal('salaires')
        }),
        React.createElement(ActionButton, {
          key: 'transaction',
          icon: Plus,
          label: 'Ajouter transaction',
          onClick: () => {
            setShowModal('transaction');
            setFormData({ type: 'depense', categorie: 'Autre' });
          }
        })
      ]),

      // Transaction List
      React.createElement(TransactionList, {
        key: 'transactions',
        transactions
      })
    ])
  );
}

// Render the app when DOM is ready
if (document.getElementById('root')) {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(BudgetApp));
}

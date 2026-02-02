// Destructure icons from global object
const { 
  Wallet, TrendingUp, TrendingDown, Plus, X, Target, 
  PiggyBank, Users, ShoppingCart, Home, Car, Utensils, 
  Film, Heart, Zap, CreditCard, BarChart3 
} = window.Icons;

// Category configuration
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

// Summary Card Component
function SummaryCard({ icon: IconComponent, label, value, color }) {
  return React.createElement('div', {
    style: {
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }
  }, [
    React.createElement('div', { 
      key: 'icon',
      style: { color, marginBottom: '0.5rem' }
    }, React.createElement(IconComponent)),
    React.createElement('p', {
      key: 'label',
      style: { 
        fontSize: '0.875rem', 
        color: '#718096', 
        margin: '0 0 0.25rem 0' 
      }
    }, label),
    React.createElement('p', {
      key: 'value',
      style: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color,
        margin: 0
      }
    }, value)
  ]);
}

// Action Button Component
function ActionButton({ icon: IconComponent, label, onClick }) {
  return React.createElement('button', {
    onClick,
    style: {
      background: 'rgba(255,255,255,0.95)',
      border: 'none',
      borderRadius: '16px',
      padding: '1.5rem',
      cursor: 'pointer',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
      fontSize: '1rem',
      fontWeight: '600',
      color: '#2d3748',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    }
  }, [
    React.createElement(IconComponent, { key: 'icon' }),
    label
  ]);
}

// Transaction Item Component
function TransactionItem({ transaction }) {
  return React.createElement('div', {
    key: transaction.id,
    style: {
      padding: '1rem',
      borderRadius: '12px',
      background: 'rgba(0,0,0,0.02)',
      marginBottom: '0.75rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }
  }, [
    React.createElement('div', { key: 'info' }, [
      React.createElement('p', {
        key: 'desc',
        style: {
          margin: '0 0 0.25rem 0',
          fontWeight: '600',
          color: '#2d3748',
          fontSize: '0.875rem'
        }
      }, transaction.description),
      React.createElement('p', {
        key: 'meta',
        style: {
          margin: 0,
          fontSize: '0.75rem',
          color: '#718096'
        }
      }, `${transaction.categorie} • ${transaction.date}`)
    ]),
    React.createElement('p', {
      key: 'amount',
      style: {
        margin: 0,
        fontSize: '1rem',
        fontWeight: '700',
        color: transaction.type === 'revenu' ? '#10b981' : '#ef4444'
      }
    }, `${transaction.type === 'revenu' ? '+' : '-'}${parseFloat(transaction.montant).toFixed(0)} $`)
  ]);
}

// Transaction List Component
function TransactionList({ transactions }) {
  if (transactions.length === 0) return null;

  return React.createElement('div', {
    style: {
      marginTop: '2rem',
      background: 'rgba(255,255,255,0.95)',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
    }
  }, [
    React.createElement('h2', {
      key: 'title',
      style: {
        margin: '0 0 1rem 0',
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#2d3748'
      }
    }, '📝 Dernières transactions'),
    ...transactions.slice(-5).reverse().map(t => 
      React.createElement(TransactionItem, { key: t.id, transaction: t })
    )
  ]);
}

// Export components
window.Components = {
  SummaryCard,
  ActionButton,
  TransactionItem,
  TransactionList,
  categories
};

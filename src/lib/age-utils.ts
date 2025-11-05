/**
 * Calculate age from birthdate
 */
export function calculateAge(birthdate: string | undefined): number | null {
  if (!birthdate) return null;
  
  try {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  } catch {
    return null;
  }
}

/**
 * Get age range description based on family role
 */
export function getAgeRangeFromRole(role: string): string {
  const roleMap: Record<string, string> = {
    'CHILD_0_5': '0-5',
    'CHILD_5_10': '5-10',
    'CHILD_10_14': '10-14',
    'CHILD_14_16': '14-16',
    'CHILD_16_ADULT': '16-18',
    'ADULT': 'Adult',
    'ADMIN': 'Admin'
  };
  
  return roleMap[role] || role;
}

/**
 * Get display text for member with age or role
 */
export function getMemberAgeDisplay(birthdate: string | undefined, role: string): string {
  const age = calculateAge(birthdate);
  
  if (age !== null && age < 18) {
    // Show actual age for children
    return `Age ${age}`;
  }
  
  // Fall back to role-based age range
  const ageRange = getAgeRangeFromRole(role);
  if (ageRange && !['ADMIN', 'ADULT'].includes(role)) {
    return ageRange;
  }
  
  // For adults, just show the role
  return role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
}

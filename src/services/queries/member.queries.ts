/**
 * GraphQL Queries for Members
 * Hardened version with metadata for resilience checks.
 */

export const GET_MEMBERS_QUERY = `
  query GetMembers {
    membersCollection(
      filter: { is_deleted: { eq: false } }
      orderBy: [{ full_name: AscNullsLast }]
    ) {
      edges {
        node {
          id
          full_name
          phone
          email
          address
          occupation
          membership_number
          membership_date
          membership_type
          status
          annual_fee_paid
          created_at
          municipalities {
            name
          }
        }
      }
      # Total count used for 'Silent RLS' anomaly detection
      pageInfo {
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

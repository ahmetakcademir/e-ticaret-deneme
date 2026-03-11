describe('Temel Senaryolar', () => {
  it('Ana sayfayı sorunsuz bir şekilde yüklemeli', () => {
    cy.visit('/')
    cy.get('body').should('be.visible')
  })
  
  it('Giriş ekranı (Login) alanlarını barındırmalı', () => {
    // Uygulama login sayfasındayken gerekli inputları kontrol ediyoruz. Projede "login" yolu olduğunu varsayarak teste eklenmiştir.
    // Eğer bir modal kullanılıyorsa, burada önce butona basılması gerekebilir, şimdilik direkt URL deniyoruz.
    cy.visit('/login')
    cy.get('input[type="email"], input[type="text"]').should('exist')
    cy.get('input[type="password"]').should('exist')
  })
})

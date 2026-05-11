<?php
/**
 * Plugin Name: WooStock Payment Gateway
 * Description: Gateway de pagamento manual para lojas integradas ao WooStock. Exibe instruções de PIX ou transferência bancária e aguarda confirmação manual do lojista.
 * Version: 1.0.0
 * Requires at least: 5.8
 * Requires PHP: 7.4
 * WC requires at least: 6.0
 * WC tested up to: 8.9
 * Author: WooStock
 * License: GPL-3.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-3.0.html
 */

defined( 'ABSPATH' ) || exit;

add_action( 'plugins_loaded', 'woostock_gateway_init', 0 );

function woostock_gateway_init() {
    if ( ! class_exists( 'WC_Payment_Gateway' ) ) {
        return;
    }

    class WC_Gateway_WooStock extends WC_Payment_Gateway {

        public function __construct() {
            $this->id                 = 'woostock';
            $this->icon               = '';
            $this->has_fields         = false;
            $this->method_title       = __( 'WooStock — Pagamento Manual', 'woostock-gateway' );
            $this->method_description = __( 'Exibe instruções de pagamento (PIX, transferência bancária) ao cliente. O lojista confirma o pagamento manualmente no painel.', 'woostock-gateway' );

            $this->init_form_fields();
            $this->init_settings();

            $this->title        = $this->get_option( 'title' );
            $this->description  = $this->get_option( 'description' );
            $this->instructions = $this->get_option( 'instructions' );

            add_action(
                'woocommerce_update_options_payment_gateways_' . $this->id,
                [ $this, 'process_admin_options' ]
            );

            add_action(
                'woocommerce_thankyou_' . $this->id,
                [ $this, 'thankyou_page' ]
            );

            add_action(
                'woocommerce_email_before_order_table',
                [ $this, 'email_instructions' ],
                10,
                3
            );
        }

        public function init_form_fields() {
            $this->form_fields = [
                'enabled' => [
                    'title'   => __( 'Ativar', 'woostock-gateway' ),
                    'type'    => 'checkbox',
                    'label'   => __( 'Ativar gateway WooStock', 'woostock-gateway' ),
                    'default' => 'no',
                ],
                'title' => [
                    'title'       => __( 'Título', 'woostock-gateway' ),
                    'type'        => 'text',
                    'description' => __( 'Texto exibido como nome do método de pagamento no checkout.', 'woostock-gateway' ),
                    'default'     => __( 'PIX / Transferência Bancária', 'woostock-gateway' ),
                    'desc_tip'    => true,
                ],
                'description' => [
                    'title'       => __( 'Descrição', 'woostock-gateway' ),
                    'type'        => 'textarea',
                    'description' => __( 'Subtítulo exibido abaixo do título no checkout.', 'woostock-gateway' ),
                    'default'     => __( 'Pague via PIX ou transferência bancária. Seu pedido será processado após a confirmação do pagamento.', 'woostock-gateway' ),
                    'desc_tip'    => true,
                ],
                'instructions' => [
                    'title'       => __( 'Instruções de Pagamento', 'woostock-gateway' ),
                    'type'        => 'textarea',
                    'description' => __( 'Instruções exibidas na página de confirmação e no e-mail do cliente. Informe a chave PIX, dados bancários ou qualquer instrução necessária.', 'woostock-gateway' ),
                    'default'     => __( "Chave PIX: exemplo@email.com\n\nApós realizar o pagamento, aguarde a confirmação do lojista. Você receberá um e-mail assim que o pedido for aprovado.", 'woostock-gateway' ),
                    'desc_tip'    => true,
                ],
            ];
        }

        public function process_payment( $order_id ) {
            $order = wc_get_order( $order_id );

            $order->update_status(
                'on-hold',
                __( 'Aguardando confirmação de pagamento manual (WooStock).', 'woostock-gateway' )
            );

            wc_reduce_stock_levels( $order_id );

            WC()->cart->empty_cart();

            return [
                'result'   => 'success',
                'redirect' => $this->get_return_url( $order ),
            ];
        }

        public function thankyou_page( $order_id ) {
            if ( empty( $this->instructions ) ) {
                return;
            }

            echo '<div class="woostock-payment-instructions">';
            echo '<h2>' . esc_html__( 'Instruções de Pagamento', 'woostock-gateway' ) . '</h2>';
            echo wpautop( wptexturize( wp_kses_post( $this->instructions ) ) );
            echo '</div>';
        }

        public function email_instructions( $order, $sent_to_admin, $plain_text ) {
            if ( $sent_to_admin ) {
                return;
            }

            if ( $order->get_payment_method() !== $this->id ) {
                return;
            }

            if ( ! in_array( $order->get_status(), [ 'on-hold', 'pending' ], true ) ) {
                return;
            }

            if ( empty( $this->instructions ) ) {
                return;
            }

            if ( $plain_text ) {
                echo "\n" . wp_strip_all_tags( $this->instructions ) . "\n";
            } else {
                echo '<h2>' . esc_html__( 'Instruções de Pagamento', 'woostock-gateway' ) . '</h2>';
                echo wpautop( wptexturize( wp_kses_post( $this->instructions ) ) );
            }
        }
    }

    add_filter(
        'woocommerce_payment_gateways',
        function ( $methods ) {
            $methods[] = 'WC_Gateway_WooStock';
            return $methods;
        }
    );
}
